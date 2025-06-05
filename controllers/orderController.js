import orderModel from "../models/orderModel.js";
import userModel from '../models/userModel.js';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


// Placing user order from Frontend
const placeOrder = async (req, res) => {
    const  frontend_url="http://localhost:5173";
    // const frontend_url = "https://foodify-frontend-iasi.onrender.com";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });


        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 * 83.7
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 50 * 100 * 83.7
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })

        res.json({ success: true, session_url: session.url })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to create order" })
    }
}


const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Order verified successfully" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment Declined" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to verify order" })
    }
}

//  user Orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })

    } catch (error) {
        console.log(error);
        res.json({ sucsess: false, message: "Failed to fetch user orders" })
    }
}


// Listing orders for Admin Panel
const listOrders = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (userData && userData.role === "admin") {
            const orders = await orderModel.find({});
            res.json({ success: true, data: orders });
        } else {
            res.json({ success: false, message: "You are not admin" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};


// Admin Order Status Update API
const updateStatus = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        if (userData && userData.role === "admin") {
            await orderModel.findByIdAndUpdate(req.body.orderId, {
                status: req.body.status,
            });
            res.json({ success: true, message: "Status Updated Successfully" });
        } else {
            res.json({ success: false, message: "You are not an admin" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};



export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
