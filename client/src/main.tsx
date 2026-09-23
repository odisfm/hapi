import ReactDOM from "react-dom/client";
import {createBrowserRouter, Navigate} from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css"
import App from "./App.tsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.tsx";
import {AuthProvider} from "./contexts/auth/AuthProvider.tsx";
import {AdminDashboard} from "./pages/admin/AdminDashboard.tsx";
import ProjectPage from "./pages/ProjectPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import {ProjectEditor} from "./components/ProjectEditor/ProjectEditor.tsx";
import {ProjectList} from "./components/ProjectList/ProjectList.tsx";
import {ModalProvider} from "./contexts/modal/ModalProvider.tsx";
import {FeaturedProjectsEditor} from "./components/FeaturedProjectsEditor/FeaturedProjectsEditor.tsx";
import {UnderConstruction} from "./components/generic/UnderConstruction.tsx";
import {ShowcaseList} from "./components/ShowcaseEditor/ShowcaseList.tsx";
import {ShowcaseEditor} from "./components/ShowcaseEditor/ShowcaseEditor.tsx";
import SearchResultsPage from "./pages/SearchResultsPage.tsx";

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
                path: "/search",
                element: <SearchResultsPage />
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
                      element: <Navigate to={"/dashboard/projects"} />
                    },
                    {
                      path: "/dashboard/projects",
                      element: <ProjectList />
                    },
                    {
                        path: "/dashboard/featured-projects",
                        element: <FeaturedProjectsEditor />
                    },
                    {
                        path: "/dashboard/showcases",
                        element: <ShowcaseList />
                    },
                    {
                        path: "/dashboard/categories",
                        element: <UnderConstruction />
                    },
                    {
                        path: "/dashboard/users",
                        element: <UnderConstruction />
                    },
                    {
                        path: "/dashboard/analytics",
                        element: <UnderConstruction />
                    }
                ]
            },
            {
                path: "/dashboard/project/:projectId",
                element: <ProjectEditor />
            },
            {
                path: "/dashboard/showcase/:showcaseId",
                element: <ShowcaseEditor />
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
