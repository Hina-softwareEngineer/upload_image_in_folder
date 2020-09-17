const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
// const base64Img = require("base64-img");
const bodyParser = require("body-parser");
const cors = require("cors");
let app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
mongoose
  .connect("mongodb://localhost:27017/testing", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.use(express.static("./public"));

// set storage engine
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("myImage");

const checkFileType = (file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error : Images Only!");
  }
};

app.get("/", (req, res) => {
  res.render("index");
  // res.json({ test: "successful" });
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render("index", { msg: err });
    } else {
      console.log("req,", req.file);
      if (req.file === undefined) {
        res.render("index", { msg: "Error : No file selected" });
      } else {
        res.render("index", {
          msg: "file uploaded",
          file: `uploads/${req.file.filename}`,
        });
      }
    }
    res.send("test");
  });
});

app.listen(4000, () => console.log("Server started"));
