import type {UserDetails} from "@hapi/shared/types/apiResponses";
import {createContext} from "react";

type AuthContextValue = {
    user: UserDetails | null;
    setUserDetails: (value: UserDetails) => void;
    logOut: () => void;
    authPending: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
