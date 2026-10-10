import { useNavigate } from "react-router";
import {useAuth} from "../../contexts/auth/useAuth.ts";
import {useEffect} from "react";

export function Protected() {
    const authContext = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
        if (authContext.authPending) {
            return
        }
        if (!authContext.user) {
            navigate("/")
        }
        switch (authContext.user!.role) {
            case "ADMIN":
                navigate("/dashboard")
                break
            case "STUDENT":
                navigate("/student")
                break
        }
    })

    return (<></>)
}