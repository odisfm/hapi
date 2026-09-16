import {useAuth} from "../../contexts/auth/useAuth.ts";
import {Outlet, useNavigate} from "react-router";
import {useEffect} from "react";


export function AdminDashboard() {
    const authContext = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authContext.user && !authContext.authPending) {
            navigate("/admin-login");
        }
    }, [authContext.user, authContext.authPending, navigate]);

    return (
        <div className={`flex flex-col gap-4 items-center w-full`}>
           <Outlet />
        </div>
    )
}
