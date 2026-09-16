import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css"
import App from "./App.tsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.tsx";
import TestApi from "./components/TestApi.tsx";
import {AuthProvider} from "./contexts/auth/AuthProvider.tsx";
import {AdminDashboard} from "./pages/admin/AdminDashboard.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <TestApi />
            },
            {
                path: "/admin-login",
                element: <AdminLoginPage />
            },
            {
                path: "/dashboard",
                element: <AdminDashboard />
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
