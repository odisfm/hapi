import * as z from "zod"
import {type ChangeEvent, useCallback, useState} from "react";
import {Button} from "../../../components/generic/Button.tsx";
import {useModal} from "../../../contexts/modal/useModal.ts";
import {API_URL} from "../../../consts.ts";
import { useNavigate } from "react-router";

type Mode = "single" | "batch"

const fieldsetStyles = `flex flex-col gap-2 text-lg mb-2`
const inputStyles = `p-2 rounded-md bg-neutral-200 self-start`

type BatchUser = {
    name: string,
    email: string
}
const emailSchema = z.email()

export function CreateUserPage(){
    const modalContext = useModal()
    const navigate = useNavigate();
    const [mode, setMode] = useState<Mode>("single");
    const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [batchUsers, setBatchUsers] = useState<BatchUser[]>([]);

    const uploadCsv = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const file = e.target.files[0];
        const text = await file.text()
        const lines = text.trim().split(/\r?\n/);
        const users: BatchUser[] = []
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const split = line.split(",")
            const name = split[0]
            const email = split[1]
            const validEmail = z.validate(emailSchema, email)
            if (!validEmail) {
                setBatchUsers([])
                return await modalContext.dispatchModal({
                    headline: "Error",
                    body: `Invalid email address on line ${i + 1}:\n${email}`
                })
            }
            users.push({name, email})
        }
        setBatchUsers(users);
    }, [modalContext])

    const createSingleUser = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/auth/create`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: name,
                    email: email,
                    role: role
                })
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            navigate("/dashboard/users")
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [modalContext, email, name, role, navigate])

    const batchCreateUsers = useCallback(async () => {
        if (!batchUsers.length) return await modalContext.dispatchModal({
            headline: "Error",
            body: "Upload a .csv file"
        })
        try {
            const body = batchUsers.map((bu: BatchUser) => {
                return {
                    ...bu,
                    role
                }
            })
            const res = await fetch(`${API_URL}/auth/create/batch`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({users: body})
            })
            if (!res.ok) {
                console.error(res)
                throw new Error(res.statusText)
            }
            navigate("/dashboard/users")
        } catch (e) {
            console.error(e)
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        }
    }, [modalContext, batchUsers, role, navigate])

    return (
        <div className={`flex flex-col gap-4`}>
            <h3 className={`font-bold text-3xl uppercase`}>Create user</h3>
            <div className={`flex gap-2 mb-6`}>
                <Button
                    color={mode === "single" ? "red" : "grey"}
                    active={mode === "single"}
                    onClick={() => setMode("single")}
                >
                    Single user
                </Button>
                <Button
                    color={mode === "batch" ? "red" : "grey"}
                    active={mode === "batch"}
                    onClick={() => setMode("batch")}
                >
                    Batch create
                </Button>

            </div>
            <div className={fieldsetStyles}>
                <label htmlFor={"email"} className={``}>Role</label>
                <select
                    className={inputStyles}
                    onChange={(e) => setRole(e.target.value as "STUDENT" | "ADMIN")}
                    value={role}
                    required
                >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>
            {mode === "single" &&
                <form>
                    <div className={fieldsetStyles}>
                        <label htmlFor={"email"} className={``}>Email</label>
                        <input
                            className={inputStyles}
                            type={"email"}
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />
                    </div>
                    <div className={fieldsetStyles}>
                        <label htmlFor={"name"} className={``}>Name</label>
                        <input
                            className={inputStyles}
                            type={"text"}
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder={"John Smith"}
                            required
                        />
                    </div>

                    <Button color={"red"} onClick={createSingleUser} styles={`mt-6`}>
                        Create user
                    </Button>
                </form>
            }
            {
                mode === "batch" &&
                <>
                <form>
                    <div className={fieldsetStyles}>
                        <label htmlFor={"csv"} className={``}>Upload CSV</label>
                        <input type={"file"} accept={".csv"} className={`${inputStyles} cursor-pointer`}
                               onChange={(e) => uploadCsv(e)}/>
                        <p className={`p-4 rounded-md bg-r-blue-300/50 self-start`}>
                            Upload a .csv file with two columns: name (first and last), and email.
                            <br/>
                            Do not include headers.
                        </p>
                    </div>

                    <Button color={"red"} onClick={batchCreateUsers} styles={`mt-6`} disabled={batchUsers.length === 0}>
                        Create {batchUsers.length} user{batchUsers.length > 1 ? "s" : ""}
                    </Button>
                </form>
                {batchUsers.length > 0 &&
                    <table>
                        <thead>
                            <tr>
                                <td>#</td>
                                <td>Name</td>
                                <td>Email</td>
                            </tr>
                        </thead>
                        <tbody>
                            {batchUsers.map((user, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                </tr>
                                ))
                            }
                        </tbody>
                    </table>
                }
                </>
            }
        </div>
    )
}