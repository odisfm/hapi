import {AuthContext} from "./AuthContext.tsx";
import {use} from "react";

export function useAuth() {
    const context = use(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
