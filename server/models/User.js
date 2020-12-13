const mongoose = require("mongoose");
const crypto = require("crypto");
const uuid = require("uuid");
const { StringDecoder } = require("string_decoder");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pic: {
      data: Buffer,
      contentType: String,
    },
    bio: {
      type: String,
      max: 50,
    },
    rollno: {
      type: String,
    },
    dob: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    encryptedpassword: {
      type: String,
      trim: true,
      required: true,
    },
    salt: {
      type: String,
    },
    role: {
      type: Number,
      default: 0,
      // 0 - Student
      // 1 - Faculty
      // 2 - Admin
    },
    age: {
      type: Number,
      trim: true,
    },
    bookmark: {
      post: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Post",
        },
      ],
      blog: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Blog",
        },
      ],
      ads: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Ads",
        },
      ],
      job: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Job",
        },
      ],
    },
    sentReqs: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      },
    ],
    receivedReqs: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      },
    ],
    friendList: [
      {
        friendId: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.virtual("password").set(function (password) {
  this.password;
  this.salt = uuid.v1();
  this.encryptedpassword = this.securePassword(password);
});

userSchema.methods = {
  authenticate: function (plainPassword) {
    return this.securePassword(plainPassword) === this.encryptedpassword;
  },
  securePassword: function (plainPassword) {
    if (!plainPassword) {
      return "";
    }
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainPassword)
        .digest("hex");
    } catch (error) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
