const mongoose = require("mongoose"),
  { Schema } = mongoose,
  passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
//.plugin=>'passport-local-mongoose
//by email default=> automatically create field for unique username
//=>and automatically create field for unique password
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
