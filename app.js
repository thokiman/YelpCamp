if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}



// console.log(
//   "this is process.env (.env file) variable: " +
//     process.env.CLOUDINARY_CLOUD_NAME,
//   process.env.CLOUDINARY_KEY,
//   process.env.CLODINARY_SECRET
// );

const express = require("express"),
  app = express(),
  path = require("path"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  ejsMate = require("ejs-mate"),
  session = require("express-session"),
  flash = require("connect-flash"),
  ExpressError = require("./utils/ExpressError"),
  passport = require("passport"),
  localStrategy = require("passport-local"),
  User = require("./models/user"),
  //security on form control XSS
  mongoSanitize = require("express-mongo-sanitize"),
  helmet = require("helmet"),
  //store session user to database
  MongoDBStore = require("connect-mongo")(session);
//ROUTE variable
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
 mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database Connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(mongoSanitize({ replaceWith: "_" }));
//Express-Session Middleware & Flash
const secret = process.env.SECRET || "thisshouldbeabettersecret";
const store = new MongoDBStore({
  url: dbURL,
  secret,
  //time period in second to 24h
  touchAfter: 24 * 60 * 60,
});
store.on("error", function (e) {
  console.log("session state error", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    //Date.now() in miliseconds to a 1 week
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// ==================================================

//Security issue HELMET Middleware
app.use(
  helmet({
    //if it breaks app
    // contentSecurityPolicy: false,
  })
);

//modify the url for adding new toolbox
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/thomascloud/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
// ==================================================

//PASSPORT Middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
//serialize: how information is stored and retrieved from the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//test passport
// app.get("/fakeUser", async (req, res) => {
//   const user = new User({ email: "Colt@gmail.com", username: "colt" });
//   console.log("this is user: ", user);
//   const newUser = await User.register(user, "chicken");
//   console.log("this is a newUser: ", newUser);
//   res.send(newUser);
// });

// ==================================================

//res.locals storage
app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
// ==================================================
//Express.ROUTER() Middleware
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// ==================================================

//MAIN Router
app.get("/", (req, res) => {
  res.render("home");
});
// ==================================================

//Star All Router
app.all("*", (req, res, next) => {
  // res.send("404!!");
  next(new ExpressError("Page Not Found", 404));
});
// ==================================================

//ERROR handler
app.use((err, req, res, next) => {
  // const { statusCode = 500, message = "Something Went Wrong" } = err;
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "oh noes, something went wrong!";
  res.status(statusCode).render("error", { err });
  // res.send("something went wrong!!");
});
// ==================================================

//PORT LISTEN
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`serving on port ${port}`);
});
// ==================================================

//testDB to page
// app.get("/makecampground", async (req, res) => {
//   //test DB
//   const camp = await new Campground({
//     title: "My Backyard",
//     description: " cheap camping!",
//   });
//   await camp.save();
//   res.send(camp);
// });
