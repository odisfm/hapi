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
import {PasswordReset} from "./pages/admin/PasswordReset/PasswordReset.tsx";
import {RootErrorBoundary} from "./components/RootErrorBoundary.tsx";
import {ShowcasePage} from "./pages/ShowcasePage.tsx";
import {StudentDashboard} from "./pages/student/StudentDashboard.tsx";
import {Protected} from "./pages/admin/Protected.tsx";
import {StudentNewProject} from "./pages/student/StudentNewProject.tsx";
import {ProjectQueue} from "./components/ProjectQueue/ProjectQueue.tsx";
import {UserPage} from "./components/UserPage/UserPage.tsx";
import {CreateUserPage} from "./components/UserPage/CreateUserPage.tsx";
import {CategoryEditor} from "./components/CategoryEditor/CategoryEditor.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        ErrorBoundary: RootErrorBoundary,
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
                path: "/protected",
                element: <Protected />
            },
            {
                path: "/admin-login",
                element: <AdminLoginPage />
            },
            {
                path: "/reset-password/:stage",
                element: <PasswordReset />
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
                        path: "/dashboard/project-queue",
                        element: <ProjectQueue />
                    },
                    {
                        path: "/dashboard/showcases",
                        element: <ShowcaseList />
                    },
                    {
                        path: "/dashboard/categories",
                        element: <CategoryEditor />
                    },
                    {
                        path: "/dashboard/users",
                        element: <UserPage />
                    },
                    {
                        path: "/dashboard/analytics",
                        element: <UnderConstruction />
                    }
                ]
            },
            {
                path: "/dashboard/users/create",
                element: <CreateUserPage />
            },
            {
                path: "/dashboard/project/:projectId",
                element: <ProjectEditor />
            },
            {
                path: "/student/project/:projectId",
                element: <ProjectEditor />
            },
            {
                path: "/dashboard/showcase/:showcaseId",
                element: <ShowcaseEditor />
            },
            {
                path: "/student",
                element: <StudentDashboard/>,
            },
            {
                path: "/student/new-project",
                element: <StudentNewProject />
            },
            {
                path: "/project/:projectSlug",
                element: <ProjectPage />
            },
            {
                path: "/showcase/:showcaseSlug",
                element: <ShowcasePage />
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
    </AuthProvider>,
);
