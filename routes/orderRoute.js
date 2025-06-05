
import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  verifyOrder,   // ← optional: remove if you don’t use verifyOrder
  userOrders,
  listOrders,
  updateStatus
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place",  placeOrder);
// If you no longer need verifyOrder, you can comment out or delete the next line:
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders",  userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

export default orderRouter;
