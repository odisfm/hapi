import {useAuth} from "../../contexts/auth/useAuth.ts";
import {Link, Outlet, useLocation, useNavigate} from "react-router";
import {useEffect} from "react";
import {Button} from "../../components/generic/Button.tsx";


export function AdminDashboard() {
    const authContext = useAuth();
    const navigate = useNavigate();
    const path = useLocation();
    const activeView = path.pathname.split("/").at(2)


    useEffect(() => {
        if (!authContext.user && !authContext.authPending) {
            navigate("/admin-login");
        }
    }, [authContext.user, authContext.authPending, navigate]);

    return (
        <div className={`flex flex-col gap-4 p-4 w-full md:w-4/5 lg:w-2/3 xl:w-3/5 2xl:w-2/5`}>
            <h1 className={`self-start font-headline font-bold text-5xl`}>Admin Dashboard</h1>
            {authContext.user &&
                <div className={`flex gap-1 items-center`}>
                    <span>Logged in as {authContext.user.name}.</span>
                    <Button
                        variant={"compact"}
                        color={"red"}
                        onClick={() => {authContext.logOut()}}
                    >
                        Log out.
                    </Button>
                </div>
            }
            <div className={`self-start flex flex-wrap gap-2 mt-4`}>
                {["Projects", "Featured Projects", "Showcases", "Categories", "Users", "Analytics"].map((viewName, i) => {
                    const view = viewName.toLowerCase().replace(" ", "-")
                    return (
                        <Link
                            to={"/dashboard/" + view}
                            key={i}
                            className={`px-4 py-2 rounded-md text-xl 
                            ${activeView === view ? `bg-r-red text-white cursor-default` : `bg-r-blue hover:bg-r-blue-700 text-white cursor-pointer`}
                            
                            `}
                        >
                            {viewName}
                        </Link>
                    )
                })}
            </div>
            <section className={`mt-12 self-stretch`}><Outlet/></section>
        </div>
    )
}
