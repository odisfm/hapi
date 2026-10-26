import { useNavigate } from "react-router";
import {useAuth} from "../../contexts/auth/useAuth.ts";
import {useCallback, useEffect} from "react";

export function Protected() {
    const authContext = useAuth()
    const navigate = useNavigate()

    const routeUser = useCallback(() => {
        if (authContext.authPending) {
            return
        }
        if (!authContext.user) {
            navigate("/")
            return
        }
        switch (authContext.user.role) {
            case "ADMIN":
                navigate("/dashboard")
                break
            case "STUDENT":
                navigate("/student")
                break
        }
    }, [authContext, navigate])

    useEffect(() => {
        routeUser()
    }, [authContext.authPending, authContext.user, navigate, routeUser])

    return (<></>)
}