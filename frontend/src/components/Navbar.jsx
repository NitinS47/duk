import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector.jsx";
import useLogout from "../hooks/useLogout.js";

export default function Navbar() {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>
            <ThemeSelector />
            <div className="avatar">
              <Link to={"/onboarding"}>
                <button className="btn btn-ghost btn-circle">
                  <div className="w-9 rounded-full">
                    <img src={authUser?.profilePicture} alt="User Avatar" rel="noreferrer" />
                  </div>
                </button>
              </Link>
            </div>
            <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
