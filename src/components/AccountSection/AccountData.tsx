import React from "react";
import avatar1 from "../../assets/avatar-1.jpg";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { menusActions } from "../../store/Menu.store";
import LayoutMenus from "../Utilities/LayoutMenus";
import DarkMode from "./DarkMode";
import DeleteTasks from "./DeleteTasks";
import TasksDone from "./TasksDone";
import { useNavigate } from "react-router-dom";

const AccountData: React.FC = () => {
  const menuOpen = useAppSelector((state) => state.menu.menuAccountOpened);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const closeMenuHandler = () => {
    dispatch(menusActions.closeMenuAccount());
  };

  // ✅ Logout Handler
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:10000/api/auth/logout", {
        method: "POST",
        credentials: "include",  // Ensure cookies are sent
      });

      if (response.ok) {
        alert("Logged out successfully!");
        navigate("/login");  // Redirect to login page
        window.location.reload();  // Force recheck of authentication
      } else {
        alert("Logout failed!");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An unexpected error occurred during logout.");
    }
  };

  return (
    <LayoutMenus
      menuOpen={menuOpen}
      closeMenuHandler={closeMenuHandler}
      className="top-0 right-0 "
    >
      <section className="p-5 flex flex-col h-full">
        <span className="flex items-center mx-auto">
          <span className="font-medium">Hi, User!</span>
          <img src={avatar1} alt="cat" className="w-10 rounded-full ml-4" />
        </span>

        <DarkMode />
        <TasksDone />
        <DeleteTasks />

        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white p-2 rounded-md text-center transition hover:bg-red-600 dark:bg-slate-700/[.3] dark:text-slate-200"
        >
          Logout
        </button>

        <a
          href="https://github.com/aridsm"
          className="mt-4 bg-rose-100 p-2 rounded-md text-rose-600 text-center transition hover:bg-rose-200 dark:bg-slate-700/[.3] dark:text-slate-200"
        >
          Eva Njoroge and Patrick
        </a>
      </section>
    </LayoutMenus>
  );
};

export default AccountData;
