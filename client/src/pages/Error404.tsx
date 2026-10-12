import {Button} from "../components/generic/Button.tsx";
import {useNavigate} from "react-router";

export function Error404() {
    const navigate = useNavigate()
    return (
        <div className={`w-80 mt-20`}>
            <h1
                className={`text-5xl font-normal mb-6`}
            >
                Error 404
            </h1>
            <p className={`text-2xl mb-12`}>
                This page wandered off.
                <br/>
                Let's take you back.
            </p>
            <Button
                onClick={() => navigate("/")}
                variant={"hero"}
            >
                HOME PAGE
            </Button>
        </div>
    )
}