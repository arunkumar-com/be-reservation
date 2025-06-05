import foodModel from "../models/foodModel.js";
import fs from 'fs'


// add food item

const addFood = async (req, res) => {
    console.log("→ req.file:", req.file);
    console.log("→ req.body:", req.body);

  // ② If no file came through, return a 400 error instead of crashing
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image file received. Make sure you send 'image' as a File (multipart/form-data)."
    });
  }
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image:  image_filename
        // image: req.body.image_url
    })

    try {
        await food.save();
        res.json({ success: true, message: "Food item added successfully" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to add food item" })

    }
}

// All Food lists
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Remove Food Items from DB
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { })
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food item removed successfully" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to remove Food item" })
    }
}

export { addFood, listFood, removeFood }