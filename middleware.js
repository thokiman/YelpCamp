const { campgroundSchema, reviewSchema } = require("./schemas"),
  Campground = require("./models/campground"),
  Review = require("./models/review"),
  ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  // console.log("this is request object express dot user from req.session.user: ", req.user);
  console.log("this is request object.user:", req.user);
  if (!req.isAuthenticated()) {
    //store the url they are requsting!
    // console.log(req.path,req.originalUrl);
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in");
    //error'cannot set header' must return value
    return res.redirect("/login");
  }
  next();
};

//validate /campgrounds page
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
  //if there is no indication terminal, error handler success
  // console.log(result);
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You have dont permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You have dont permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//validate /campgrounds/:id/reviews page
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
