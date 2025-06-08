// import userModel from "../models/userModel.js";
// import jwt from "jsonwebtoken"
// import bcrypt from "bcryptjs"
// import validator from "validator"



// // Login User
// const loginUser = async (req, res) => {


//     const { email, password } = req.body;
//     try {
//         const user = await userModel.findOne({ email })

//         if (!user) {
//             return res.json({ success: false, message: "User not found" })
//         }

//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.json({ success: false, message: "Invalid password" })
//         }


//         const token = createToken(user._id);
//         res.json({ success: true, token })


//     } catch (error) {
//         console.log(error);
//         res.json({ sucess: false, message: "Error logging in user" })
//     }
// }

// const createToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET)
// }


// // Register User
// const registerUser = async (req, res) => {
//     const { name, password, email } = req.body;
//     try {
//         // Checking if the user already exists
//         const exists = await userModel.findOne({ email })
//         if (exists) {
//             return res.json({ success: false, message: "Email already exists" })
//         }

//         // Validating email format and strong pwd
//         if (!validator.isEmail(email)) {
//             return res.json({ success: false, message: "Please Enter a Valid Email" })

//         }

//         if (password.length < 8) {
//             return res.json({ success: false, message: "Please enter a Strong Password" })
//         }

//         // Hashing the password
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new userModel({
//             name: name,
//             email: email,
//             password: hashedPassword
//         })

//         const user = await newUser.save();
//         const token = createToken(user._id)
//         res.json({ success: true, token })

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Failed to Register User" })
//     }
// }

// export { loginUser, registerUser }



import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

// Create JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = createToken(user._id);

    // ✅ Set cookie
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });
    res.cookie('token',token ,{httpOnly:true ,secure:true,sameSite:'strict',maxAge:3600000});
    
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error logging in user" });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;

  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    // ✅ Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to register user" });
  }
};

export { loginUser, registerUser };
