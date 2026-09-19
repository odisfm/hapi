import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css"
import App from "./App.tsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.tsx";
import {AuthProvider} from "./contexts/auth/AuthProvider.tsx";
import {AdminDashboard} from "./pages/admin/AdminDashboard.tsx";
import ProjectPage from "./pages/ProjectPage.tsx";
import HomePage from "./pages/HomePage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "/admin-login",
                element: <AdminLoginPage />
            },
            {
                path: "/dashboard",
                element: <AdminDashboard />
            },
            {
                path: "/project/:projectSlug",
                element: <ProjectPage />
            }
        ]
    },
]);

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
);
