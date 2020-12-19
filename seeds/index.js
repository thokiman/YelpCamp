const mongoose = require("mongoose"),
  cities = require("./cities"),
  { places, descriptors } = require("./seedHelpers"),
  Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database Connected");
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDb = async () => {
  await Campground.deleteMany({});
  //test DB
  //   const c = Campground({ title: "purple field" });
  //   await c.save();
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // your user ID, thomas
      author: "5fa62fa7cf9cf0112a973684",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // non dynamic images
      // image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam varius ligula id ante finibus tincidunt fringilla quis dolor. Nam non sollicitudin nisi. Phasellus tincidunt luctus erat vitae ornare. In facilisis ante at metus fermentum congue. Quisque ut malesuada dolor. Vestibulum gravida elit leo, sit amet eleifend sapien tincidunt eu. Maecenas ultrices felis purus, et scelerisque odio euismod vel. Phasellus porta mi sit amet sapien lobortis pellentesque. Donec pulvinar vel enim quis feugiat.",
      price,
      //mapbox
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      //dynamic images
      images: [
        {
          url:
            "https://res.cloudinary.com/thomascloud/image/upload/v1604830377/YelpCamp/pf1fp2pseljolu4pn5i5.jpg",
          filename: "YelpCamp/pf1fp2pseljolu4pn5i5",
        },
        {
          url:
            "https://res.cloudinary.com/thomascloud/image/upload/v1604830381/YelpCamp/fmdaytam68pz374u9yvw.png",
          filename: "YelpCamp/fmdaytam68pz374u9yvw",
        },
        {
          url:
            "https://res.cloudinary.com/thomascloud/image/upload/v1604830381/YelpCamp/dpmh4w3ao6vu0ycrbikv.jpg",
          filename: "YelpCamp/dpmh4w3ao6vu0ycrbikv",
        },
      ],
    });
    await camp.save();
  }
};

seedDb().then(() => {
  //how we close mongoose connection
  mongoose.connection.close();
  console.log("connection closed");
});
