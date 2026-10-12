import type {ProjectVersionFeedbackItemType} from "@hapi/shared/types/project";
import { Button } from "../../../components/generic/Button";
import {useModal} from "../../../contexts/modal/useModal.ts";
import Markdown from "react-markdown";
import {FaClock, FaEye} from "react-icons/fa";
import { formatDistance } from "date-fns";

export function FeedbackHistory({history}: {history: ProjectVersionFeedbackItemType[]}) {
    const modalContext = useModal()
    return (
        <>
            <h4 className={`font-bold`}>Feedback history</h4>
            <ul className={`flex flex-col gap-2`}>
                {history.map((item, i) => {
                    const date = `${formatDistance(item.reviewedAt, new Date(), {addSuffix: true})}`
                    return (
                        <li
                            key={i}
                            className={`flex gap-2 items-center`}>
                            <span className={`flex items-center gap-1`}>
                                <FaClock />
                                {date}
                            </span>
                            <span className={`font-bold`}>{item.reviewer}</span>
                            <Button
                                ariaLabel={"View feedback"}
                                styles={`ml-auto`}
                                onClick={async () => {
                                    await modalContext.dispatchModal({
                                        headline: `Feedback | ${item.reviewer} | ${date}`,
                                        body: <div className={`feedback-modal`}><Markdown>{item.feedback}</Markdown>
                                        </div>
                                    })
                                }}
                            >
                                View
                                <FaEye/>
                            </Button>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}