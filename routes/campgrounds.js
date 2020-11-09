const express = require("express"),
  router = express.Router(),
  {
    index,
    renderNewForm,
    createCampground,
    showCampground,
    renderEditForm,
    updateCampground,
    deleteCampground,
  } = require("../controllers/campground"),
  catchAsync = require("../utils/catchAsync"),
  { isLoggedIn, isAuthor, validateCampground } = require("../middleware"),
  //multiple data upload
  multer = require("multer"),
  { storage } = require("../cloudinary"),
  upload = multer({ storage });

router
  .route("/")
  //INDEX Route =======================================
  .get(catchAsync(index))
  //POST ROUTE =======================================
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(createCampground)
  );

//NEW ROUTE =======================================
router.get("/new", isLoggedIn, renderNewForm);
router
  .route("/:id")
  //SHOW ROUTE =======================================
  .get(catchAsync(showCampground))

  //UPDATE ROUTE =======================================
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(updateCampground)
  )
  //DELETE ROUTE =======================================
  .delete(isLoggedIn, isAuthor, catchAsync(deleteCampground));

//EDIT ROUTE =======================================
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(renderEditForm));
module.exports = router;

//test cloudinary image asset
// .post(upload.array("image"), (req, res) => {
//   console.log(req.body, req.files);
//   res.send("post the image path");
// });
