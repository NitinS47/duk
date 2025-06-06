import { useState } from "react";
import {OrigamiIcon} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { signup } from "../lib/api.js";
import useSignUp from "../hooks/useSignUp.js";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const { mutate: signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (data.success) {
        navigate("/verify-otp", { state: { email: signupData.email } });
      }
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to sign up");
    }
  });

  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className='h-screen flex items-center justify-center p-4 sm:p-6 md:p-8' data-theme="luxury">
      <div className='border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden'>

      <div className='w-full lg:w-1/2 p-4 sm:p-8 flex flex-col'>
        <div className='mb-4 flex items-center justify-start gap-2'>
          <OrigamiIcon className='size-9 text-primary' />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            DUK
          </span>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <div>
              {/* <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 w-6 h-6" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> */}
                {/* <path d="M12 8v4m0 4h.01M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path> */}
              {/* </svg> */}
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="w-full">
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold"> Create an Account</h2>
                <p className="text-sm opacity-70">
                  Networking made easy. Join us to connect with like-minded individuals.
                </p>
              </div>

              <div className="space-y-3">
                <div className="form-control w-full">
                  <label className="label-text">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input type="text"
                  placeholder="John Doe"
                  className="input input-bordered w-full"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  required
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label-text">
                    <span className="label-text">Email</span>
                  </label>
                  <input type="email"
                  placeholder="johndoe@gmail.com"
                  className="input input-bordered w-full"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label-text">
                    <span className="label-text">Password</span>
                  </label>
                  <input type="password"
                  placeholder="********"
                  className="input input-bordered w-full"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  />
                  <p className="text-xs opacity-70 mt-1">
                    Password must be at least 6 characters long.
                  </p>
                </div>

                <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>

              </div>

              <button className="btn btn-primary w-full" type="submit">
                {isPending ? (
                  <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Loading...
                  </>
                ):(
                  "Create Account"
                )}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <a href="/login" className="text-primary hover:underline">
                    Sign in
                  </a>
                </p>

              </div>

            </div>
          </form>
        </div> 
      </div>
      
      <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with passionate people all over the world</h2>
              <p className="opacity-70">
                Network, make friends, and improve your skills with like-minded individuals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
