import {useCallback, useEffect, useMemo, useState} from "react";
import type {LoginSuccessResponse, UserDetails} from "@hapi/shared/types/apiResponses";
import {AuthContext} from "./AuthContext.tsx";
import {API_URL} from "../../consts.ts";

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null)

    useEffect(() => {
        (async () => {
            let res: Response
            try {
                res = await fetch(`${API_URL}/auth/me`, {
                    method: "GET",
                    credentials: "include",
                })
                if (res.ok) {
                    const json = await res.json() as LoginSuccessResponse;
                    setUserDetails({...json.user})
                } else {
                    //
                }
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    const logOut = useCallback(async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            })
        } catch (e) {
            console.error(e)
        } finally {
            setUserDetails(null)
        }
    }, [])

    const value = useMemo(() => {
        return {
            user: userDetails,
            setUserDetails,
            logOut,
        }
    }, [userDetails, logOut])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
