import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import { BellIcon, HomeIcon, MenuIcon, OrigamiIcon, UsersIcon, XIcon } from "lucide-react";

export default function Sidebar() {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
          currentPath === "/" ? "bg-primary/10 text-primary" : "hover:bg-base-300/50"
        } ${mobile ? "w-full" : ""}`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <HomeIcon className="size-5" />
        <span>Home</span>
      </Link>

      <Link
        to="/friends"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
          currentPath === "/friends" ? "bg-primary/10 text-primary" : "hover:bg-base-300/50"
        } ${mobile ? "w-full" : ""}`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <UsersIcon className="size-5" />
        <span>Friends</span>
      </Link>

      <Link
        to="/notifications"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
          currentPath === "/notifications" ? "bg-primary/10 text-primary" : "hover:bg-base-300/50"
        } ${mobile ? "w-full" : ""}`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <BellIcon className="size-5" />
        <span>Notifications</span>
      </Link>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-base-200/80 backdrop-blur-sm"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <XIcon className="size-6" />
        ) : (
          <MenuIcon className="size-6" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-base-200 border-r border-base-300 transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-base-300">
          <Link 
            to="/" 
            className="flex items-center gap-2.5"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <OrigamiIcon className="size-8 text-primary" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              DUK
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLinks mobile />
        </nav>
        <div className="p-4 border-t border-base-300">
          <Link 
            to="/profile" 
            className="flex items-center gap-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="avatar">
              <div className="w-10 rounded-full ring-2 ring-primary/50">
                <img src={authUser?.profilePicture} alt="User Avatar" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success" />
                Online
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-base-200 border-r border-base-300 flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-base-300">
          <Link to="/" className="flex items-center gap-2.5">
            <OrigamiIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              DUK
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-base-300">
          <Link to="/onboarding" className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-200">
                <img src={authUser?.profilePicture} alt="User Avatar" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success" />
                Online
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
