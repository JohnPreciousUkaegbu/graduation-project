const express = require("express");
const { body } = require("express-validator");
const Multer = require("multer");
const { memoryStorage } = require("multer");

const restaurantController = require("../controllers/restaurant");
const { Restaurant } = require("../model/restaurant");
const restAuth = require("../util/rest-Auth");

const router = express.Router();

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

//signup for restaurant
router.post(
  "/signup",
  upload.single("image"),
  [
    body("name"),
    body("phone")
      .isNumeric({ no_symbols: false })
      .withMessage("invalid phone number"),
    body("password").trim().isLength({ min: 5 }),
    body("confirmPassword").trim().isLength({ min: 5 }),
    body("address").notEmpty().trim(),
    body("city").notEmpty().trim(),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .trim()
      .custom((value) => {
        return Restaurant.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("email address already exists!");
          }
        });
      }),
  ],
  restaurantController.putSignupRest
);

//login for resturants
router.post(
  "/login",
  [
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("invalid password"),
    body("email")
      .isEmail()
      .withMessage("invalid email")
      .trim()
      .normalizeEmail(),
  ],
  restaurantController.postLoginRestaurant
);

//edit route
router.put(
  "/edit",
  restAuth,
  [
    body("name"),
    body("phone")
      .isNumeric({ no_symbols: false })
      .withMessage("invalid phone number"),
  ],
  restaurantController.putEditRestaurant
);

//check password
router.get(
  "/check-password",
  body("password").trim().isLength({ min: 5 }),
  restAuth,
  restaurantController.getCheckPassword
);

router.delete("/", restAuth, restaurantController.deleteRestaurant);

router.get("/:id", restaurantController.getRestaurant);

router.get("/", restaurantController.getRestaurants);

module.exports = router;
