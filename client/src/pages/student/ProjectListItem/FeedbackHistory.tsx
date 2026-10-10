import type {ProjectVersionFeedbackItemType} from "@hapi/shared/types/project";
import { Button } from "../../../components/generic/Button";
import {useModal} from "../../../contexts/modal/useModal.ts";
import Markdown from "react-markdown";
import {FaEye} from "react-icons/fa";

export function FeedbackHistory({history}: {history: ProjectVersionFeedbackItemType[]}) {
    const modalContext = useModal()
    return (
        <>
            <h4 className={`font-bold`}>Feedback history</h4>
            <ul className={`flex flex-col gap-2`}>
                {history.map((item, i) => (
                    <li
                        key={i}
                        className={`flex gap-2 items-center`}>
                        <span className={`font-bold`}>{String(item.reviewedAt)}</span>
                        <span>{item.reviewer}</span>
                        <Button
                            ariaLabel={"View feedback"}
                            styles={`ml-auto`}
                            onClick={async () => {
                                await modalContext.dispatchModal({
                                    headline: `Feedback | ${String(item.reviewedAt)}`,
                                    body: <div className={`feedback-modal`}><Markdown>{item.feedback}</Markdown></div>
                                })
                            }}
                        >
                            View
                            <FaEye />
                        </Button>
                    </li>
                ))}
            </ul>
        </>
    )
}