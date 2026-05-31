import { createBrowserRouter, RouterProvider } from "react-router";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CoordinatorDashboard from "./pages/CoordinatorDashboard.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ParticipantDashboard from "./pages/ParticipantDashboard.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/coordinator",
    element: <CoordinatorDashboard />,
  },
  {
    path: "/participant",
    element: <ParticipantDashboard />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
