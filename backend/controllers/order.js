const { Cart } = require("../model/cart");
const { Order } = require("../model/order");
const { Restaurant } = require("../model/restaurant");
const { User } = require("../model/user");
const newError = require("../util/error");

//order items in cart
exports.postOrderAll = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw newError("user Id not found", 404);
    }

    const userLocationId = req.params.locationId;
    if (!userLocationId) {
      throw newError("Location Id not found", 404);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw newError("user not found", 404);
    }

    let userCart = await Cart.findOne({ userId }).populate("items.item");
    if (!userCart) {
      throw newError("cart not found", 404);
    }

    const location = user.location.find((l) => l._id == userLocationId);
    if (!location) {
      throw newError("location not found", 404);
    }

    const orderItems = userCart.items.map((i) => {
      let price = i.quantity * i.item.price;
      return {
        price,
        quantity: i.quantity,
        item: i.item,
        status: "pending",
        restaurant: i.item.restaurant,
      };
    });

    // TODO: add socket.io here to emit to the restaurant that a new other is placed to that restaurant

    let order = new Order({
      location,
      user: userId,
      items: orderItems,
    });

    // console.log(order);

    order = order.save();

    userCart.deleteOne();

    return res.status(200).json({ msg: "ordered" });
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userOrders = await Order.find({ user: user._id })
      .populate("items.item")
      .populate("items.restaurant");

    const ordersWithoutUser = userOrders.map((order) => {
      const { user, ...orderWithoutUser } = order.toObject();
      return orderWithoutUser;
    });

    return res.status(200).json({ orders: ordersWithoutUser });
  } catch (error) {
    next(error);
  }
};

exports.getRestaurantOrders = async (req, res, next) => {
  const restaurantId = req.restId;

  const restaurant = await Restaurant.findOne({ _id: restaurantId });
  if (!restaurant) {
    throw newError("Restaurant not found", 404);
  }

  const restaurantOrders = await Order.find({
    "items.restaurant": restaurantId,
  });

  const filteredOrders = restaurantOrders.map((order) => ({
    ...order._doc,
    items: order.items.filter(
      (item) => item.restaurant.toString() === restaurantId
    ),
  }));

  return res.status(200).json({ orders: filteredOrders });
};
