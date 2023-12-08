const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { Restaurant } = require("../model/restaurant");
const ValErrorCheck = require("../util/validationError");
const newError = require("../util/error");
const { MenuItem } = require("../model/menu-item");
const { googleDriveDelete } = require("../util/google-drive");
const { Cart } = require("../model/cart");

//sign auth token
const _signToken = (rest) => {
  return jwt.sign(
    {
      id: rest.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "20h",
    }
  );
};

//restauratn sign up page
exports.putSignupRest = async (req, res, next) => {
  try {
    const valErr = ValErrorCheck(req);
    if (valErr) next(valErr);

    const email = req.body.email;
    const name = req.body.name;
    const pw = req.body.password;
    const confirmPw = req.body.confirmPassword;
    const address = req.body.address || "";
    const phone = req.body.phone;

    //confirm the passwords
    if (confirmPw !== pw) {
      throw newError("passwords not match", 400);
    }

    //hash the password
    const hashpw = bcrypt.hashSync(pw, 12);

    //create the rest
    const createRest = {
      name,
      email,
      password: hashpw,
      address,
      phone,
    };

    const rest = await Restaurant.create(createRest);

    const token = _signToken(rest);

    res.status(201).json({ msg: "created", token });
  } catch (error) {
    next(error);
  }
};

//login restaurants
exports.postLoginRest = async (req, res, next) => {
  try {
    const valErr = ValErrorCheck(req);
    if (valErr) {
      throw valErr;
    }

    const rest = await Restaurant.findOne({ email: req.body.email });
    if (!rest) {
      throw newError("user with email does not exist");
    }

    //check password
    let pwEqual = await bcrypt.compare(req.body.password, rest.password);
    if (!pwEqual) {
      throw newError("invalid password", 401);
    }

    const token = _signToken(rest);

    rest.status = true;
    await rest.save();

    //check items in the menu
    const menuItems = await MenuItem.find({ restaurantId: rest.id });
    const hasItem = menuItems.length > 0;

    res.status(200).json({ msg: "logged in", hasItem, token });
  } catch (error) {
    next(error);
  }
};

//editing the rest
exports.putEditRestaurant = async (req, res, next) => {
  const valErr = ValErrorCheck(req);
  if (valErr) next(valErr);

  try {
    //updating the rest
    const rest = await Restaurant.findOneAndUpdate(
      { _id: req.rest_Id },
      {
        name: req.body.name,
        phone: req.body.phone,
      }
    );

    res.status(200).json({ msg: "edited" });
  } catch (error) {
    next(error);
  }
};

//checking if password is correct
exports.getCheckPassword = async (req, res, next) => {
  const valErr = ValErrorCheck(req);
  if (valErr) next(valErr);

  try {
    const rest = await Restaurant.findOne({ _id: req.rest_Id });

    const passwordMatch = bcrypt.compareSync(req.body.password, rest.password);
    if (passwordMatch) {
      res.status(200).json({ msg: "matched" });
    } else {
      res.status(400).json({ msg: "unmatched" });
    }
  } catch (error) {
    next(error);
  }
};

//deleting the rest
exports.deleteRestaurant = async (req, res, next) => {
  const restId = req.rest_Id;

  try {
    const rest = await Restaurant.findOneAndDelete({ _id: restId });

    //delete the menu items
    const menuItems = await MenuItem.find({ restaurantId: req.restId });

    for (let i = 0; i < menuItems.length; i++) {
      const deleteImg = googleDriveDelete(menuItems[i].imageId);
      if (deleteImg instanceof Error) {
        throw deleteImg;
      }
      await MenuItem.deleteMany({ id: menuItems[i].id });
    }

    //delete cartItems
    await Cart.deleteMany({ restaurantId: restId });

    res.status(200).json({ msg: "deleted" });
  } catch (error) {
    next(error);
  }
};

//geting a rest with id
exports.getRestaurant = async (req, res, next) => {
  try {
    const Id = req.params.id;

    const restaurant = await Restaurant.findOne({ _id: Id });
    if (!restaurant) {
      throw newError("restaurant not found", 400);
    }

    const restaurantMenu = await MenuItem.find({
      restaurantId: restaurant.id,
    });

    res.status(200).json({ restaurant, menu: restaurantMenu });
  } catch (error) {
    next(error);
  }
};

//getting all the restaurants
exports.getRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find();

    res.status(200).json({ restaurants });
  } catch (error) {
    next(error);
  }
};
