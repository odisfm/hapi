import {useNavigate, useParams} from "react-router";
import * as z from "zod";
import {PasswordSchema} from "@hapi/shared/types/password";
import {useRef, useState} from "react";
import {API_URL} from "../../../consts.ts";
import {useModal} from "../../../contexts/modal/useModal.ts";
import type {LoginSuccessResponse} from "@hapi/shared/types/apiResponses";
import {useAuth} from "../../../contexts/auth/useAuth.ts";

const buttonStyles = `px-6 py-2 rounded-md text-white bg-r-blue-700 hover:bg-r-blue self-start cursor-pointer`
const fieldsetStyles = `flex flex-col gap-2 mt-6`

type Stage = "request" | "verify" | "new-password" | "force-reset"

let badPasswordFeatures: string[] = [];
try {
    PasswordSchema.parse("")
} catch (e) {
    const zError = e as z.ZodError
    badPasswordFeatures = zError.issues.map(x => x.message)
}

export function PasswordReset() {
    const modalContext = useModal();
    const authContext = useAuth();
    const params = useParams();
    const navigate = useNavigate();
    const stage: Stage = params.stage as Stage;
    const [newPasswordIssues, setNewPasswordIssues] = useState<string[]>([...badPasswordFeatures]);
    const emailRef = useRef<HTMLInputElement>(null);
    const newPasswordRef = useRef<HTMLInputElement>(null);
    const confirmNewPasswordRef = useRef<HTMLInputElement>(null);
    if (!stage || !["request", "verify", "force-reset", "new-password"].includes(stage)) {
        navigate("/reset-password/request")
    }

    function validatePassword(password: string) {
        try {
            PasswordSchema.parse(password)
        } catch (e) {
            const zError = e as z.ZodError
            const issues = zError.issues.map(x => x.message)
            setNewPasswordIssues(issues)
            return issues
        }
        setNewPasswordIssues([])
        return []
    }

    async function submitForm(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (stage === "request") {
            const email = formData.get("email");
            if (!email) {
                return
            }
            let res
            try {
                res = await fetch(`${API_URL}/auth/forgot-password`, {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                    })
                })
                if (!res.ok) {
                    throw new Error(res.statusText)
                }
                navigate("/reset-password/verify")

            } catch (e) {
                console.error(e)
                await modalContext.dispatchModal({
                    headline: "Error",
                    body: String(e),
                    buttons: [{id: "ok", text: "Ok", variant: "default"}]
                })
            }
        }
        else if (stage === "verify") {
            const code = formData.get("code");
            if (!code) return
            if (!emailRef.current) return
            const email = emailRef.current.value;

            let res
            try {
                res = await fetch(`${API_URL}/auth/forgot-password/verify`, {
                    credentials: "include",
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        code
                    })
                })
                if (!res.ok) {
                    const json = await res.json()
                    if (json) {
                        throw new Error(json.error)
                    }
                    throw new Error(res.statusText)
                }
                const json: LoginSuccessResponse = await res.json()
                authContext.setUserDetails(json.user)
                navigate("/reset-password/new-password")
            } catch (e) {
                console.error(e)
                await modalContext.dispatchModal({
                    headline: "Error",
                    body: String(e),
                    buttons: [{id: "ok", text: "Ok", variant: "default"}]
                })
            }
        }
        else if (stage === "new-password" || stage === "force-reset") {
            if (!newPasswordRef.current || !confirmNewPasswordRef.current) return
            const password = formData.get("password");
            const confirmPassword = formData.get("confirmPassword");
            if (password !== confirmPassword) {
                newPasswordRef.current.value = ""
                confirmNewPasswordRef.current.value = ""
                return await modalContext.dispatchModal({
                    headline: "Error",
                    body: "Passwords do not match",
                    buttons: [{id: "ok", text: "Ok", variant: "default"}]
                })
            }
            let res: Response
            try {
                res = await fetch(`${API_URL}/auth/password`, {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        password: newPasswordRef.current.value
                    })
                })
                if (!res.ok) {
                    throw new Error(res.statusText)
                }
                authContext.setUserDetails({
                    ...authContext.user!,
                    needsPasswordReset: false
                })
                navigate("/dashboard")
            } catch (e) {
                console.error(e)
                await modalContext.dispatchModal({
                    headline: "Error",
                    body: String(e),
                    buttons: [{id: "ok", text: "Ok", variant: "default"}]
                })
            }
        }
    }

    return (
        <div className={`flex flex-col gap-4 mt-20`}>
            <h2 className={`font-bold text-xl`}>Reset password</h2>
                <form onSubmit={(e) => submitForm(e)}>
                    { stage === "request" &&
                    <p className={`w-80`}>
                        Enter your email address. If you have an account, a password reset email will be sent.
                    </p>
                    }
                    {
                        stage === "verify" &&
                        <p className={`w-80`}>
                            Enter the code sent to your email address. Code is only valid for 15 minutes.
                        </p>
                    }
                    {
                        stage === "force-reset" &&
                        <>
                            <p className={`w-80`}>
                                You must set a new password before proceeding.
                            </p>
                            <button className={buttonStyles}>
                                Log out and return home
                            </button>
                        </>
                    }

                    <fieldset className={fieldsetStyles}>
                        <label>Email</label>
                        <input
                            ref={emailRef}
                            id={"email"}
                            name={"email"}
                            type={"email"}
                            className={`p-2 rounded-md bg-neutral-200 ${stage !== "request" && `cursor-not-allowed`}`}
                            required={true}
                            disabled={stage !== "request"}
                        />
                    </fieldset>

                    {stage === "verify" &&
                        <fieldset className={fieldsetStyles}>
                            <label>Enter code</label>
                            <input
                                id={"code"}
                                name={"code"}
                                min={8}
                                max={8}
                                className={`p-2 rounded-md bg-neutral-200 self-start w-40`}
                                required={true}
                            />
                        </fieldset>
                    }

                    {
                        (stage === "new-password" || stage === "force-reset") &&
                        <div>
                            <ul className={`p-4`}>
                                {badPasswordFeatures.map((x, i) => (
                                    <li
                                        key={i}
                                        className={`${!newPasswordIssues.includes(x) && `line-through`}`}
                                    >
                                        {x}
                                    </li>
                                    ))}
                            </ul>

                            <fieldset className={fieldsetStyles}>
                                <label htmlFor={"newPassword"}>New password</label>
                                <input
                                    ref={newPasswordRef}
                                    className={`p-2 rounded-md bg-neutral-200`}
                                    type={"password"}
                                    required={true}
                                    id={"newPassword"}
                                    name={"newPassword"}
                                    onChange={(e) => {validatePassword(e.target.value)}}
                                />
                            </fieldset>
                            <fieldset className={fieldsetStyles + " mt-1"}>
                                <label htmlFor={"newPassword"}>Confirm new password</label>
                                <input
                                    ref={confirmNewPasswordRef}
                                    className={`p-2 rounded-md bg-neutral-200`}
                                    type={"password"}
                                    required={true}
                                    id={"confirmNewPassword"}
                                    name={"confirmNewPassword"}
                                />
                            </fieldset>
                        </div>
                    }

                    {
                        <button
                        type={"submit"}
                        className={`${buttonStyles} mt-12`}
                        >
                            {(() => {
                                if (stage === "request") {
                                    return "Request reset"
                                } else if (stage === "verify") {
                                    return "Verify code"
                                } else if (stage === "new-password" || stage === "force-reset") {
                                    return "Set new password"
                                }
                                return ""
                            })()}
                        </button>
                    }
                </form>
        </div>
    )
}