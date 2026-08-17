import {useState} from "react";

type ApiStatus = true | false | undefined;

export default function TestApi() {
    const [apiStatus, setApiStatus] = useState<ApiStatus>(undefined);

    async function getApiStatus(): Promise<ApiStatus> {
        console.log("testing api")
        let res: Response;
        try {
            res = await fetch(import.meta.env.VITE_API_URL)
        } catch (e) {
            console.error(e)
            return false;
        }
        if (!res || !res.ok) {
            return false
        }
        else {
            return true
        }
    }

    let buttonText: string
    if (apiStatus === undefined) {
        buttonText = "Click to test API"
    } else {
        if (apiStatus) {
            buttonText = "Success! 🟢"
        } else {
            buttonText = "Failure! 🔴"
        }
    }

    return (
        <div className={`flex flex-col gap-4`}>
            <button
                onClick={async () => {
                    const status = await getApiStatus();
                    setApiStatus(status);
                }}
                className={`p-2 bg-neutral-200 hover:bg-neutral-300 rounded-md cursor-pointer`}
            >
                {buttonText}
            </button>
        </div>
    )
}