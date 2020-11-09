const mongoose = require("mongoose"),
  { Schema } = mongoose;
const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
//parse virtual document to virtual JSON
const opts = { toJSON: { virtuals: true } };

// CampgroundSchema is virtual properties to a Schema
const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  opts
);
//create virtual Campground{properties:{popMarkup;'<h3></h3>'}}
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});
//post deleted review - middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  console.log("it was deleted: ", doc);
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
