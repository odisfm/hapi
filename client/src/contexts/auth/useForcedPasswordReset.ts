import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";
import {useAuth} from "./useAuth.ts";

export const FORCED_RESET_PATH = "/reset-password/force-reset"

/**
 * Sends a signed-in user whose `needsPasswordReset` flag is set to the forced reset page, from
 * wherever they are, until they set a new password or log out. The flag is set on accounts an
 * admin creates (their password was emailed) and by the `createAdmin` script.
 *
 * Pages under /reset-password/ are left alone, so the "forgot password" flow (which also sets
 * the flag) can finish on its own new-password stage.
 */
export function useForcedPasswordReset() {
    const {user} = useAuth()
    const {pathname} = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (user?.needsPasswordReset && !pathname.startsWith("/reset-password/")) {
            navigate(FORCED_RESET_PATH, {replace: true})
        }
    }, [user, pathname, navigate])
}
