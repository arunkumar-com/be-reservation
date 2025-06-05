
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Placing user order from Frontend (no Stripe)
const placeOrder = async (req, res) => {
  try {
    // 1) Create & save the new order in MongoDB
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      // You can decide whether to set `payment` to true immediately
      // or keep it false and update later via another endpoint.
      payment: true
    });

    await newOrder.save();

    // 2) Clear the user's cart (if you still want this behavior)
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // 3) Return success + the created order’s ID
    return res.json({
      success: true,
      orderId: newOrder._id,
      message: "Order placed successfully (no Stripe)."
    });
  } catch (error) {
    console.error("placeOrder error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to place order" });
  }
};

// (Optional) If you no longer need `verifyOrder`, you can delete it.
// Below is an example “manual verification” endpoint that simply sets `payment = true`.
const verifyOrder = async (req, res) => {
  const { orderId, paid } = req.body;
  try {
    if (paid === true || paid === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.json({
        success: true,
        message: "Order marked as paid (manually)."
      });
    } else {
      // If “paid” is false or missing, delete or leave unpaid
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Order payment declined." });
    }
  } catch (error) {
    console.error("verifyOrder error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify order" });
  }
};

// Fetch all orders for a single user
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error("userOrders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch user orders" });
  }
};

// List all orders (admin only)
const listOrders = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      return res.json({ success: true, data: orders });
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view all orders."
      });
    }
  } catch (error) {
    console.error("listOrders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching orders." });
  }
};

// Admin can update order status (e.g., “Preparing” → “Out for Delivery” → “Delivered”)
const updateStatus = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status
      });
      return res.json({
        success: true,
        message: "Order status updated successfully."
      });
    } else {
      return res
        .status(403)
        .json({ success: false, message: "You are not an admin." });
    }
  } catch (error) {
    console.error("updateStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating status." });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
