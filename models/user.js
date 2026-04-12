const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: "You must enter a valid email",
    },
  },
  avatar: {
    type: String,
    default: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    validate: {
      validator(url) {
        return validator.isURL(url);
      },
      message: "You must enter a valid URL",
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.pre("save", function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  return bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }

    this.password = hash;
    return next();
  });
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Incorrect email or password"));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error("Incorrect email or password"));
        }

        return user;
      });
    });
};

module.exports = mongoose.model("User", userSchema);
