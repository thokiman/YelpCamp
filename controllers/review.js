const Campground = require("../models/campground"),
  Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  //test id for campground-review: 5f9ebe93d09b430c0debfefc
  // need .Router{mergeParams: true}
  // console.log(req.params);
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new reviews!!!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findById(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
};
