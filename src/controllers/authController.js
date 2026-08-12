const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");

// Google OAuth CLIENT BNAO
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Signup controller function

exports.Signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // step 0: validation(check kro ki sari fields ayyi hai yah nahi)
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // step 1 : check whether email address already exist
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User Already exists" });
    }

    // step 2: password ko hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // step 3: user ko DB me save karo hashed passoword ke saath
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // //console.log(newUser);
    // step 4:creating a jwt token for auto-login
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    newUser.password = undefined;
    // //console.log(newUser);

    // step 5: sucess response bhejna

    return res.status(201).json({
      success: true,
      message: "Account successfully created",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        // role:newUser.role
      },
      message: "Registered Successfully!",
      token,
    });
  } catch (error) {
    // //console.log(error);

    return res.status(500).json({
      success: false,
      message: "server error during registration",
    });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // step1:validation (check kro ki dono fields ayyi hai yah nahi)
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // step2:check user existance
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // step 3: password  Match krenge

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    // //console.log(isPasswordCorrect);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentails" });
    }

    // step 4: Token generation karo

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    delete user.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        // role:user.role
      },
      token,
    });
  } catch (error) {
    // //console.log("Login error: ", error);
    return res.status(500).json({
      success: false,
      message: "server error",
      error: error,
    });
  }
};

// GoogleLogin controller function
// POST /api/v1/auth/google
exports.HandleGoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // Frontend se aya google ka jwt token
    // //console.log("value: ", credential);
    // step 1: goggle se verify kro ki yeh token asli hai
    const ticket = await googleClient.verifyIdToken({
      idToken: credential, //ye token verify krna hai
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // step 2: Token se user ki information nikalo
    const payload = ticket.getPayload();
    // //console.log(payload);
    const { sub, email, name, picture, email_verified } = payload;
    //  sub     = Google ka unique user ID
    //  email   = User ka email
    //  name    = User ka naam
    //  picture = Profile photo URL

    // step 3: check karo ki user ki email verified hai yah nahi
    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google email is not verified",
      });
    }

    // step 4 : check kaaro ki user already present hai kya database me
    let user = await User.findOne({ email: email });
    if (user) {
      // user already hai -> googleid update karo (agar nahi hai toh)

      if (!user.googleId) {
        user.googleId = sub;
        user.avatar = picture;
        await user.save();
      }
      // Naya user hai -> account bnao
    } else {
      user = await User.create({
        username: name,
        email: email,
        googleId: sub,
        avatar: picture,
        authProvider: "google",
        // password nahi de rahe — Google user ke paas password nahi hota
      });
    }

    // step 4: Apna JWT bnao (same jese normal login me bnate ho)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // step 6: Response bhej do fronted ko
    return res.status(200).json({
      success: true,
      message: "Successfully login",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    // //console.log("Google auth error:", err);
    res.status(500).json({
      success: false,
      message: "Google authentication error",
    });
  }
};

// Logout controller function in future

// getMyprofile controller function

exports.GetMyprofile = async (req, res) => {
  // kyunki 'isAuthenticated' middleware ne req.user phele hi set kar diya hai ,hum seddha bhej denge

  res.status(200).json({
    success: true,
    user: req.user,
  });
};
