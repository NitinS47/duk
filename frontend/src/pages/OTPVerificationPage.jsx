import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "../lib/api";
import { useMutation } from "@tanstack/react-query";

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const { mutate: verifyOTPMutation, isPending } = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      if (data.success) {
        navigate("/onboarding");
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to verify OTP");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    verifyOTPMutation({ email, otp });
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setOtp(value);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Access</h2>
            <p className="text-base-content opacity-70">
              Please sign up first to verify your email.
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => navigate("/signup")}
            >
              Go to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-base-content opacity-70 mt-2">
            Enter the 4-digit OTP sent to {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">OTP</span>
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 4-digit OTP"
              className="input input-bordered w-full text-center text-2xl tracking-widest"
              maxLength={4}
              pattern="\d{4}"
              required
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isPending}
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-base-content opacity-70">
            Didn't receive the OTP?{" "}
            <button
              className="link link-primary"
              onClick={() => navigate("/signup")}
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage; 