import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        <Link
          to="/orders"
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          Order CRM
        </Link>

        <div className="flex items-center gap-6">

          <Link
            to="/orders"
            className="text-gray-600 dark:text-gray-300"
          >
            Orders
          </Link>

          <Link
            to="/orders/create"
            className="text-gray-600 dark:text-gray-300"
          >
            Create Order
          </Link>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Moon className="h-5 w-5 text-gray-300" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600" />
            )}
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;