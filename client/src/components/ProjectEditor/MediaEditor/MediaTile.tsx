import type {ProjectMediaType} from "@hapi/shared/types/projectMedia";
import {useEffect, useRef, useState} from "react";
import {draggable, dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {combine} from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
    attachClosestEdge,
    extractClosestEdge,
    type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

export function MediaTile({media, index, setActiveMedia}: {
    media: ProjectMediaType,
    index: number,
    setActiveMedia: (media: ProjectMediaType) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        return combine(
            draggable({
                element: el,
                getInitialData: () => ({index}),
                onDragStart: () => setDragging(true),
                onDrop: () => setDragging(false)
            }),
            dropTargetForElements({
                element: el,
                getData: ({input, element}) =>
                    attachClosestEdge({index}, {input, element, allowedEdges: ["left", "right"]}),
                onDrag: ({self}) => setClosestEdge(extractClosestEdge(self.data)),
                onDragLeave: () => setClosestEdge(null),
                onDrop: () => setClosestEdge(null)
            })
        );
    }, [index]);

    return (
        <div ref={ref} className={`relative ${dragging ? "opacity-50" : ""}`} onClick={() => setActiveMedia(media)}>
            {closestEdge && (
                <div
                    className={`absolute top-0 bottom-0 w-0.5 bg-blue-500 ${
                        closestEdge === "left" ? "left-0" : "right-0"
                    }`}
                />
            )}
            <img
                draggable={false}
                src={`${import.meta.env.VITE_S3_MEDIA_BUCKET}${media.uri}.webp`}
                className={`object-cover max-w-40 max-h-40`}
            />
        </div>
    )
}