const express = require("express"),
  router = express.Router({ mergeParams: true }),
  { createReview, deleteReview } = require("../controllers/review"),
  catchAsync = require("../utils/catchAsync"),
  { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");

//campground-review POST ROUTE =====================

router.post("/", isLoggedIn, validateReview, catchAsync(createReview));

//campground-review POST ROUTE =====================
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(deleteReview)
);

module.exports = router;
