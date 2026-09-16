import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css"
import App from "./App.tsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.tsx";
import TestApi from "./components/TestApi.tsx";
import {AuthProvider} from "./contexts/auth/AuthProvider.tsx";
import {AdminDashboard} from "./pages/admin/AdminDashboard.tsx";
import ProjectPage from "./pages/ProjectPage.tsx";
import {ProjectEditor} from "./components/ProjectEditor/ProjectEditor.tsx";
import {ProjectList} from "./components/ProjectList/ProjectList.tsx";
import {ModalProvider} from "./contexts/modal/ModalProvider.tsx";

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
                element: <AdminDashboard />,
                children: [
                    {
                      index: true,
                      element: <ProjectList />
                    },
                    {
                        path: "/dashboard/project/:projectId",
                        element: <ProjectEditor />
                    }
                ]
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
    <ModalProvider>
    <RouterProvider router={router} />
    </ModalProvider>
    </AuthProvider>
);
