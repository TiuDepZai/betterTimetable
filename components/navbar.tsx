"use client"; // Required for usePathname()

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react"; // Import useState for dropdown toggle
import { logout as logoutSession } from "../src/auth/sessionManager"; // Import the logout function
import "../styling/globals.css";

export default function Navbar({ user }) {
  const pathname = usePathname(); // Get current route
  const router = useRouter(); // Use router to redirect after logout
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

  // Function to toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const result = await logoutSession();
      if (result.success) {
        router.push("/login");
      } else {
        console.error("Logout failed:", result.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="navbar bg-blue-1200 text-white">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost sm:hidden"
            onClick={toggleDropdown} // Toggle dropdown on click
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>

          {/* Links when app is condensed */}
          {isDropdownOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow bg-gray-1200"
            >
              <li><Link href="/generate" className="text-lg">Generate</Link></li>
              <li><Link href="/plan" className="text-lg">Plan</Link></li>
              <li><Link href="/saved" className="text-lg">Saved</Link></li>
              <li><Link href="/course" className="text-lg">Course</Link></li>
              <li><Link href="/explore" className="text-lg">Explore</Link></li>
            </ul>
          )}
        </div>

        <Link href="/" className="btn btn-ghost hover:bg-gray-700 rounded-full text-xl px-6 flex items-center space-x-4">
          {/* Logo */}
          <div className="qutLogo w-10 h-10"></div>
          {/* Text */}
          <div className="inline">
            <span className="text-white font-normal">Better</span>
            <span className="text-blue-1000 font-normal inline">Timetable</span>
          </div>
        </Link>
      </div>

      <div className="navbar-center hidden sm:flex">
        <ul className="menu menu-horizontal text-white">
          <li>
            <Link
              href="/generate"
              className={`mx-2 px-5 py-2 rounded-full text-lg ${pathname === "/generate" ? "active-link" : "hover:bg-gray-700"}`}
            >
              Generate
            </Link>
          </li>
          <li>
            <Link
              href="/plan"
              className={`mx-2 px-5 py-2 rounded-full text-lg ${pathname === "/plan" ? "active-link" : "hover:bg-gray-700"}`}
            >
              Plan
            </Link>
          </li>
          {user && (
            <li>
              <Link
                href="/saved"
                className={`mx-2 px-5 py-2 rounded-full text-lg ${pathname === "/saved" ? "active-link" : "hover:bg-gray-700"}`}
              >
                Saved
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/course"
              className={`mx-2 px-5 py-2 rounded-full text-lg ${pathname === "/course" ? "active-link" : "hover:bg-gray-700"}`}
            >
              Course
            </Link>
          </li>
          <li>
            <Link
              href="/explore"
              className={`mx-2 px-5 py-2 rounded-full text-lg ${pathname === "/explore" ? "active-link" : "hover:bg-gray-700"}`}
            >
              Explore
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
          <ul className="menu menu-horizontal pl-1 pr-4">
          {user ? (
            <li>
              <details>
                <summary className="hover:bg-gray-700 rounded-full text-lg">{user.firstName} {user.lastName}</summary>
                <ul className="p-2 text-lg z-[1]">
                  <li><a>Account</a></li>
                  <li><a>Settings</a></li>
                  <li>
                    <button onClick={handleLogout} className="w-full text-left p-2 rounded-lg">
                      <p className="pl-2 text-lg">Logout</p>
                    </button>
                  </li>
                </ul>
              </details>
            </li>
          ) : (
            <li key="/login">
              <Link
                href="/login"
                className={`mx-2 px-5 py-2 rounded-full text-lg ${pathname === "/login" ? "active-link" : "hover:bg-gray-700"}`}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
