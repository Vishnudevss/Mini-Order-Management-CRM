
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, ShoppingCart } from "lucide-react";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;

      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return newMode;
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/orders"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
              Order CRM
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:block">
              Management System
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">

          <Link
            to="/orders"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 ${
              isActive("/orders")
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            }`}
          >
            Orders
          </Link>

          <Link
            to="/orders/create"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 ${
              isActive("/orders/create")
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            }`}
          >
            Create Order
          </Link>

          {/* Divider */}
          <div className="mx-2 hidden h-6 w-px bg-gray-200 sm:block dark:bg-gray-700" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-all duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;

