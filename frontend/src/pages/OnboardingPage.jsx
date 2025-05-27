import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { completeOnboarding } from "../lib/api";
import { useState } from "react";
import { CameraIcon, LoaderIcon, MapPinIcon, MusicIcon, OrigamiIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import toast from "react-hot-toast";
import { INTERESTS } from "../constants/index.js";
import { useNavigate } from "react-router-dom";

const OnboardingPage = () => {
  const {authUser} = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    location: authUser?.location || "",
    interests: authUser?.interests || [],
  });

  const {mutate: onboardingmutation, isPending} = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Onboarding completed successfully");
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
      navigate("/");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingmutation(formState);
  };

const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    setFormState({ ...formState, profilePicture: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Profile</h1>
          <form onSubmit={handleSubmit} className="spacde-y-6">
             <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePicture ? (
                  <img
                    src={formState.profilePicture}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
                {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
              </div>
                {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>
              
                {/* INTEREST */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Interest</span>
              </label>
              <div className="relative">
                <MusicIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="interests"
                  value={formState.interests}
                  onChange={(e) => setFormState({ ...formState, interests: e.target.value })}
                  className="input input-bordered w-full pl-10"
                  placeholder="eg: Music"
                />
              </div>
            </div>




            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full pl-10"
                  placeholder="City"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}

            <button className="btn btn-primary w-full mt-4" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <OrigamiIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>   
    </div>
  )
}

export default OnboardingPage
