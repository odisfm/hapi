import {FaQuestion} from "react-icons/fa";

type Props = {
    uri: string
    width: number // px
}

export function AppIcon({uri, width}: Props) {
    const hasIcon = uri.length > 0;

    return (
        <div
            className={`bg-neutral-400 flex items-center justify-center aspect-square`}
            style={{
                width: `${width}px`,
                height: `${width}px`,
                borderRadius: "28%"
            }}
        >
            {hasIcon ?
                <img
                src={`${import.meta.env.VITE_S3_ICON_BUCKET}${uri}.webp`}
                alt={`App icon`}
                className={``}
                style={{
                    width: `${width}px`,
                    height: `${width}px`,
                    borderRadius: "26%"
                }}
            />
                :
                <FaQuestion className={`text-white`} size={width * .5}/>
            }
        </div>
    )
}