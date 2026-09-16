import { MdConstruction } from "react-icons/md";
import {useAuth} from "../../contexts/auth/useAuth.ts";
import {useNavigate} from "react-router";
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
        <div className={`flex flex-col gap-4 items-center`}>
            <div className={`flex gap-2 items-center text-3xl font-bold mt-6`}>
                <MdConstruction className={`animate-spin`}/>
                <h1 className={``}>Under construction!!!</h1>
                <MdConstruction className={`animate-spin`}/>
            </div>

            <button
                onClick={authContext.logOut}
                className={`
                    cursor-pointer px-4 py-2 font-bold bg-r-blue-700 hover:bg-r-blue-950 
                    text-white rounded-md mt-6
                    `}
            >
                Log out
            </button>
        </div>
    )
}
