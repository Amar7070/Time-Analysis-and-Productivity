import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../config/firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";

const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const googleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Obtain Firebase ID Token
      const idToken = await user.getIdToken();

      // Send to backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/google-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google login failed on server");
      }

      // Save token and update context immediately
      await authLogin(data.data.token, data.data.user);

      toast.success("Login successful");
      navigate("/dashboard");
      return data.data;
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error(error.message || "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return { googleLogin, loading };
};

export default useGoogleLogin;
