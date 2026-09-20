import {useAuth} from "../../contexts/auth/useAuth.ts";
import {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router";
import type {LoginSuccessResponse} from "@hapi/shared/types/apiResponses";
import {API_URL} from "../../consts.ts";

const inputClasses = `p-1 bg-neutral-200 rounded-md`

export default function AdminLoginPage() {
    const authContext = useAuth()
    const navigate = useNavigate();
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const [errorText, setErrorText] = useState('')

    useEffect(() => {
        if (authContext.user) {
            navigate("/dashboard")
        }
    }, [authContext, navigate])

    const logIn = useCallback(
        async (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!emailRef.current || !passwordRef.current) return

            let res: Response
            try {
                res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: emailRef.current.value,
                        password: passwordRef.current.value,
                    }),
                    credentials: 'include',
                })
                if (res.status === 200) {
                    const json: LoginSuccessResponse = await res.json()
                    authContext.setUserDetails(json.user)
                } else {
                    const json = await res.json()
                    if (json.error) {
                        setErrorText(json.error)
                    } else {
                        setErrorText(`${res.status}: ${res.statusText}`)
                    }
                }
            } catch (error) {
                console.error(error)
                setErrorText("Couldn't connect to the server. Try again later.")
            }

        }, [authContext])

    return (
        <div className={`flex flex-col gap-2 justify-self-start mt-24`}>
            <h1 className={`text-xl font-bold`}>Admin Login</h1>
            <form onSubmit={(e) => {logIn(e)}}>
                {errorText &&
                    <p className={`p-2 bg-r-blue text-white`}>
                        {errorText}
                    </p>
                }
                <fieldset>
                    <legend>Email</legend>
                    <input
                        type={"email"}
                        ref={emailRef}
                        required
                        className={inputClasses}
                    />
                </fieldset>
                <fieldset>
                    <legend>Password</legend>
                    <input
                        type={"password"}
                        ref={passwordRef}
                        required
                        className={inputClasses}
                    />
                </fieldset>
                <button
                    type={"submit"}
                    className={`
                    cursor-pointer px-4 py-2 font-bold bg-r-blue-700 hover:bg-r-blue-950 
                    text-white rounded-md mt-6
                    `}
                >
                    Log in
                </button>
            </form>
        </div>
    );
}