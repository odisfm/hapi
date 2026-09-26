import {useEffect, useRef, useState} from "react";
import {MdChevronLeft, MdChevronRight} from "react-icons/md";
import type {ProjectMediaType} from "@hapi/shared/types/projectMedia";
import {CarouselScreenshot} from "./CarouselScreenshot.tsx";
import {resolveStorageUrl} from "../utils/misc.ts";

export const MEDIA_BUCKET_URL = import.meta.env.VITE_S3_MEDIA_BUCKET;

type Props = {
    media: ProjectMediaType[],
    videoUrl: string | null,
    projectName: string
}

export function MediaCarousel({media, videoUrl, projectName}: Props) {
    const [canScrollMediaLeft, setCanScrollMediaLeft] = useState(false);
    const [canScrollMediaRight, setCanScrollMediaRight] = useState(false);
    const [carouselSidePadding, setCarouselSidePadding] = useState({left: 0, right: 0});
    const mediaCarouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mediaCarousel = mediaCarouselRef.current;

        if (!mediaCarousel) {
            return;
        }

        const updateScrollState = () => {
            setCanScrollMediaLeft(mediaCarousel.scrollLeft > 0);
            setCanScrollMediaRight(
                mediaCarousel.scrollLeft + mediaCarousel.clientWidth < mediaCarousel.scrollWidth - 1
            );
        };

        updateScrollState();
        mediaCarousel.addEventListener("scroll", updateScrollState);

        return () => mediaCarousel.removeEventListener("scroll", updateScrollState);
    }, [media.length]);

    useEffect(() => {
        const mediaCarousel = mediaCarouselRef.current;

        if (!mediaCarousel) {
            return;
        }

        return // legacy code, keeping if needed later

        // const updateCarouselPadding = () => {
        //     const firstMediaItem = mediaCarousel.firstElementChild as HTMLElement | null;
        //     const lastMediaItem = mediaCarousel.lastElementChild as HTMLElement | null;
        //
        //     if (!firstMediaItem || !lastMediaItem) {
        //         setCarouselSidePadding({left: 0, right: 0});
        //         return;
        //     }
        //
        //     setCarouselSidePadding({
        //         left: Math.max((mediaCarousel.clientWidth - firstMediaItem.offsetWidth) / 2, 0),
        //         right: Math.max((mediaCarousel.clientWidth - lastMediaItem.offsetWidth) / 2, 0),
        //     });
        // };
        //
        // updateCarouselPadding();
        // const resizeObserver = new ResizeObserver(updateCarouselPadding);
        //
        // resizeObserver.observe(mediaCarousel);
        //
        // return () => resizeObserver.disconnect();
    }, [media.length]);

    useEffect(() => {
        const animationFrame = requestAnimationFrame(updateMediaScrollState);

        return () => cancelAnimationFrame(animationFrame);
    }, [carouselSidePadding]);

    function updateMediaScrollState() {
        const mediaCarousel = mediaCarouselRef.current;

        if (!mediaCarousel) {
            return;
        }

        setCanScrollMediaLeft(mediaCarousel.scrollLeft > 0);
        setCanScrollMediaRight(
            mediaCarousel.scrollLeft + mediaCarousel.clientWidth < mediaCarousel.scrollWidth - 1
        );
    }

    function scrollMedia(direction: number) {
        const mediaCarousel = mediaCarouselRef.current;

        if (!mediaCarousel) {
            return;
        }

        const mediaItems = Array.from(mediaCarousel.children) as HTMLElement[];
        const carouselCenter = mediaCarousel.scrollLeft + mediaCarousel.clientWidth / 2;
        const centeredItemIndex = mediaItems.reduce((closestIndex, mediaItem, itemIndex) => {
            const itemCenter = mediaItem.offsetLeft + mediaItem.offsetWidth / 2;
            const closestItemCenter = mediaItems[closestIndex].offsetLeft + mediaItems[closestIndex].offsetWidth / 2;

            return Math.abs(itemCenter - carouselCenter) < Math.abs(closestItemCenter - carouselCenter)
                ? itemIndex
                : closestIndex;
        }, 0);
        const targetItem = mediaItems[centeredItemIndex + direction];

        if (!targetItem) {
            return;
        }

        mediaCarousel.scrollTo({
            behavior: "smooth",
            left: targetItem.offsetLeft - (mediaCarousel.clientWidth - targetItem.offsetWidth) / 2,
        });
    }

    return (
        <>
            <div
                ref={mediaCarouselRef}
                onScroll={updateMediaScrollState}
                style={{paddingLeft: 0, paddingRight: 0}}
                className="no-scrollbar flex h-80 gap-4 overflow-x-auto scroll-smooth"
            >
                {videoUrl &&
                    <video
                        controls={true}
                        src={resolveStorageUrl(MEDIA_BUCKET_URL, videoUrl, ".webm")}
                        className={`rounded-lg`}
                    />
                }
                {media.map((m) => (
                    <CarouselScreenshot
                        key={m.id}
                        media={m}
                        projectName={projectName}
                        updateMediaScrollState={updateMediaScrollState}
                        mediaCarouselRef={mediaCarouselRef || null}
                        setCarouselSidePadding={setCarouselSidePadding}
                    />
                ))}
            </div>
            {(canScrollMediaLeft || canScrollMediaRight) && (
                <>
                    <button
                        type="button"
                        aria-label="Previous screenshot"
                        disabled={!canScrollMediaLeft}
                        onClick={() => scrollMedia(-1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-2xl disabled:invisible"
                    >
                        <MdChevronLeft/>
                    </button>
                    <button
                        type="button"
                        aria-label="Next screenshot"
                        disabled={!canScrollMediaRight}
                        onClick={() => scrollMedia(1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-2xl disabled:invisible"
                    >
                        <MdChevronRight />
                    </button>
                </>
            )}
        </>
    )
}