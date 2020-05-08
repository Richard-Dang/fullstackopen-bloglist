const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  name: String,
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});

userSchema.plugin(uniqueValidator);

userSchema.set("toJSON", {
  transform: (doc, obj) => {
    (obj.id = obj._id.toString()), delete obj._id;
    delete obj.__v;
    delete obj.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
