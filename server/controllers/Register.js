import { registerUser, loginUser, googleAuthUser } from "../services/authService.js";

export const signup = async (req, res, next) => {
  try {
    // Validation is already handled by Zod middleware
    const { user, token } = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Signup successful.",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          projects: user.projects,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          projects: user.projects,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const { user, token, isNewUser } = await googleAuthUser(idToken);

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? "Google signup successful." : "Login successful.",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          projects: user.projects,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
