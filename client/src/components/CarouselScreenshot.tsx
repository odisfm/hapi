import {MEDIA_BUCKET_URL} from "./MediaCarousel";
import type { ProjectMediaType } from "@hapi/shared/types/projectMedia";
import {type Dispatch, type RefObject, type SetStateAction} from "react";
import {resolveStorageUrl} from "../utils/misc.ts";

type Props = {
    media: ProjectMediaType,
    openImage: () => void,
    projectName: string,
    updateMediaScrollState: () => void,
    mediaCarouselRef: RefObject<HTMLDivElement | null>,
    setCarouselSidePadding: Dispatch<SetStateAction<{
        left: number;
        right: number;
    }>>
}

export function CarouselScreenshot(
    {
        media,
        openImage,
        projectName,
        updateMediaScrollState,
        mediaCarouselRef,
        setCarouselSidePadding
    }: Props) {

    return (
        <div key={media.uri} className="h-full shrink-0 snap-center">
            <img
                src={resolveStorageUrl(MEDIA_BUCKET_URL, media.uri, ".webp")}
                alt={`${projectName} screenshot`}
                onClick={() => {
                    openImage();
                }}
                onLoad={() => {
                    updateMediaScrollState();
                    if (!mediaCarouselRef?.current) return
                    const mediaCarousel = mediaCarouselRef.current;
                    const firstMediaItem = mediaCarousel?.firstElementChild as HTMLElement | null;
                    const lastMediaItem = mediaCarousel?.lastElementChild as HTMLElement | null;

                    if (mediaCarousel && firstMediaItem && lastMediaItem) {
                        setCarouselSidePadding({
                            left: Math.max((mediaCarousel.clientWidth - firstMediaItem.offsetWidth) / 2, 0),
                            right: Math.max((mediaCarousel.clientWidth - lastMediaItem.offsetWidth) / 2, 0),
                        });
                    }
                }}
                className={`
                    h-full w-auto max-w-none rounded-lg object-contain cursor-pointer
                    `}
            />
        </div>
    )
}