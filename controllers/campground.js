const Campground = require("../models/campground");

//MAPBOX access '@mapbox/mapbox-sdk/services/{service}'
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"),
  mapBoxToken = process.env.MAPBOX_TOKEN,
  //provide forwardGeocode and reverseGeocode
  geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//cloudinary access
const { cloudinary } = require("../cloudinary");
// console.log(process.env);

//MVC (models views controller)
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const { location } = req.body.campground;
  const geoData = await geocoder
    .forwardGeocode({
      query: location,
      limit: 1,
    })
    .send();
  //basic logic error route handler
  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
  const campground = await new Campground(req.body.campground);
  // return geoJSON particular format
  campground.geometry = geoData.body.features[0].geometry;
  //cloudinary image asset
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "successfully made a new campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  console.log(campground);
  if (!campground) {
    req.flash("error", "Cannot find the campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find the campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(
    id,
    {
      ...req.body.campground,
    },
    { new: true }
  );
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // [{url,filename}]=>...{url,filename}1 {url,filename}n
  campground.images.push(...imgs);
  if (req.body.deleteImage) {
    for (let filename of req.body.deleteImage) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImage } } },
    });
    console.log(campground);
  }
  await campground.save();
  req.flash("success", "Successfully updated campgrounds");
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You have dont permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campgrounds");
  res.redirect("/campgrounds");
};
