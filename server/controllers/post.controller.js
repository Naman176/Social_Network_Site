const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

exports.getPostById = (req, res, next, Id) => {
  Post.findById(Id)
    .populate("user")
    .exec((err, post) => {
      if (err) {
        return res.status(400).json({
          errorMsg: "An error occured",
        });
      }
      if (!post) {
        return res.status(400).json({
          errorMsg: "Post not found",
        });
      }
      post.user.salt = undefined;
      post.user.encryptedpassword = undefined;
      req.post = post;
      next();
    });
};

fs.mkdir("uploads", (err) => {
  if (err) {
  }
  fs.mkdir("uploads/posts", (err) => {
    if (err) {
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      "post_" +
        new Date(Date.now())
          .toISOString()
          .replace(/-|:|Z|\./g, "")
          .replace(/T/g, "_") +
        path.extname(file.originalname)
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/gif" ||
    file.mimetype == "image/svg+xml" ||
    file.mimetype == "video/mp4"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
exports.upload = multer({ storage: storage, fileFilter: fileFilter });

exports.createPost = (req, res) => {
  const { user, content } = req.body;
  const files = req.files;
  const picture = [];
  for (let i = 0; i < files.length; i++) {
    picture[i] = files[i].path;
  }
  const newPost = Post({ user, content, picture });
  newPost.save((err, post) => {
    if (err) {
      res.status(400).json({
        errorMsg: "An error occured",
      });
    }
    return res.status(200).json(post);
  });
};

exports.allposts = (req, res) => {
  Post.find()
    .populate("user")
    .sort({ updatedAt: -1 })
    .exec((err, posts) => {
      if (err) {
        res.status(400).json({
          errorMsg: "An error occured",
        });
      }
      posts.map((post) => {
        post.user.salt = undefined;
        post.user.encryptedpassword = undefined;
      });
      return res.json(posts);
    });
};

//Read a particular post
exports.getPost = (req, res) => {
  // Post.find({ _id: req.post._id }).exec((err, post) => {
  //   if (err) {
  //     res.status(400).json("error")
  //   }
  //   return res.json(post)
  // })
  return res.json(req.post);
};

// update post
exports.updatePost = (req, res) => {
  Post.findById({ _id: req.post._id }).exec((err, post) => {
    for (let picture of post.picture) {
      let path = picture;

      fs.readdir(path, (err, files) => {
        if (path) {
          fs.unlink(path, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
      });
    }

    const { user, content } = req.body;
    const files = req.files;
    const picture = [];
    for (let i = 0; i < files.length; i++) {
      picture[i] = files[i].path;
    }
    const updateObj = { user, content, picture };

    Post.findByIdAndUpdate(
      { _id: req.post._id },
      { $set: updateObj },
      { useFindAndModify: false, new: true },
      (err, post) => {
        if (err || !post) {
          return res.status(400).json({
            error: "An error occured,  try again later",
          });
        }
        return res.status(200).json(post);
      }
    );
  });
};

// delete post
exports.deletePost = (req, res) => {
  Post.findByIdAndRemove(
    { _id: req.post._id },
    { useFindAndModify: false, new: true },
    (err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: "An error occured,  try again later",
        });
      }
      return res.status(200).json({ message: "Post has been deleted" });
    }
  );
};
