const express = require("express");
const { body } = require("express-validator");
const Multer = require("multer");

const restAuth = require("../util/rest-Auth");
const menuController = require("../controllers/menu-item");

const router = express.Router();

const { memoryStorage } = require("multer");

//multer option
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = new Multer({ storage: memoryStorage(), fileFilter });

//add-item
router.put(
  "/add-item",
  upload.single("image"),
  [
    body("name").isAscii().trim(),
    body("description").isAscii().trim(),
    body("price").isNumeric().trim(),
  ],
  restAuth,
  menuController.putAddItem
);

//edi-item
router.post(
  "/edit-item/:id",
  upload.single("image"),
  [
    body("name").isAscii().trim(),
    body("description").isAscii().trim(),
    body("price").isNumeric().trim(),
  ],
  restAuth,
  menuController.postEditMenuItem
);

router.delete("/delete-item/:id", restAuth, menuController.deleteItem);

module.exports = router;
