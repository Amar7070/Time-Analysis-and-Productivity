import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import admin from "../config/firebaseAdmin.js";

export const registerUser = async (userData) => {
  const { firstName, lastName, email, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.status = 400;
    error.isOperational = true;
    throw error;
  }

  const newUser = await User.create({ firstName, lastName, email, password });
  const token = generateToken(newUser._id.toString());

  return { user: newUser, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 400;
    error.isOperational = true;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 400;
    error.isOperational = true;
    throw error;
  }

  const token = generateToken(user._id.toString());
  return { user, token };
};

export const googleAuthUser = async (idToken) => {
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (verifyError) {
    const error = new Error("Invalid or expired Firebase token.");
    error.status = 401;
    error.isOperational = true;
    throw error;
  }

  const { email, name, picture } = decodedToken;
  if (!email) {
    const error = new Error("Email not provided by Google authentication.");
    error.status = 400;
    error.isOperational = true;
    throw error;
  }

  const firstName = name ? name.split(" ")[0] : "User";
  const lastName = name ? name.split(" ").slice(1).join(" ") : "";
  const avatar = picture || "";

  let user = await User.findOne({ email });
  let isNewUser = false;

  if (!user) {
    const randomPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    user = await User.create({
      firstName,
      lastName,
      email,
      password: randomPassword,
      avatar,
    });
    isNewUser = true;
  }

  const token = generateToken(user._id.toString());
  return { user, token, isNewUser };
};
