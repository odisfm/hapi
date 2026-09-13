import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css"
import App from "./App.tsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/admin-login",
        element: <AdminLoginPage />,
    },
]);

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
    <RouterProvider router={router} />,
);
