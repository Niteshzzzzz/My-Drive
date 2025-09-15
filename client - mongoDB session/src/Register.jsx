import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import "./Auth.css";
import { googleAuthAPI } from "./apis/googleAuthAPI";
import { continueWithGitHub } from "./apis/gitHubAuthAPI";

const Register = () => {
  const BASE_URL = "http://localhost:4000";

  const [formData, setFormData] = useState({
    name: "Nitesh Kumar",
    email: "niteshkr1661@gmail.com",
    password: "abcd",
  });

  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setServerError("");
      setOtpError("");
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Send OTP handler
  const handleSendOtp = async () => {
    const { email } = formData;
    if (!email) {
      setOtpError("Please enter your email first.");
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setCountdown(60); // allow resend after 60s
        setOtpError("");
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Something went wrong sending OTP.");
    } finally {
      setIsSending(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    const { email } = formData;
    if (!otp) {
      setOtpError("Please enter OTP.");
      return;
    }

    try {
      setIsVerifying(true);
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpVerified(true);
        setOtpError("");
      } else {
        setOtpError(data.error || "Invalid or expired OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Something went wrong verifying OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Final form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setIsSuccess(false);

    if (!otpVerified) {
      setOtpError("Please verify your email with OTP before registering.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.error) {
        setServerError(data.error);
      } else {
        setIsSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error(error);
      setServerError("Something went wrong. Please try again.");
    }
  };

    useEffect(() => {
      const handleMessage = (event) => {
        if (event.data.githubLogin == true) {
          navigate('/')
        } else if(!event.data) {
          alert('Something went wrong!')
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
      <div className="container">
        <h2 className="heading">Register</h2>
        <form className="form" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name" className="label">
              Name
            </label>
            <input
              className="input"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email + Send OTP */}
          <div className="form-group">
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="otp-wrapper">
              <input
                className={`input ${serverError ? "input-error" : ""}`}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              <button
                type="button"
                className="otp-button"
                onClick={handleSendOtp}
                disabled={isSending || countdown > 0}
              >
                {isSending
                  ? "Sending..."
                  : countdown > 0
                    ? `${countdown}s`
                    : "Send OTP"}
              </button>
            </div>

          </div>

          {/* OTP Input + Verify */}
          {otpSent && (
            <div className="form-group">
              <label htmlFor="otp" className="label">
                Enter OTP
              </label>
              <div className="otp-wrapper">
                <input
                  className="input"
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="4-digit OTP"
                  maxLength={4}
                  required
                />
                <button
                  type="button"
                  className="otp-button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otpVerified}
                >
                  {isVerifying
                    ? "Verifying..."
                    : otpVerified
                      ? "Verified"
                      : "Verify OTP"}
                </button>
              </div>
              {serverError && <span className="error-msg">{serverError}</span>}
              {otpError && <span className="error-msg">{otpError}</span>}
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              className="input"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className={`submit-button ${isSuccess ? "success" : ""}`}
            disabled={!otpVerified || isSuccess}
          >
            {isSuccess ? "Registration Successful" : "Register"}
          </button>
        </form>

        <p className="link-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <div className="or">
          <span>Or</span>
        </div>

        <div className="google-login">
          <GoogleLogin
            onSuccess={async credentialResponse => {
              const data = await googleAuthAPI(credentialResponse.credential)
              if (data.error) {
                console.log(data)
              }
              navigate('/')
            }}
            theme="filled_blue"
            text="continue_with"
            onError={() => {
              console.log('Login Failed');
            }}
          useOneTap  
          />
          <button type="button" className="github-btn" onClick={continueWithGitHub}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 1792 1792">
              <path d="M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z"></path>
            </svg>
            Continue with GitHub
          </button>
        </div>
      </div>
    );
  };

  export default Register;
