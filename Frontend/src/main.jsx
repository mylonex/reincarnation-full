import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import DashboardPage from "./DashboardPage";
import DashboardEditPage from "./DashboardEditPage";
import ChatPage from "./ChatPage";
import AdminPage from "./AdminPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/dashboardEdit", element: <DashboardEditPage /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/admin", element: <AdminPage /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
