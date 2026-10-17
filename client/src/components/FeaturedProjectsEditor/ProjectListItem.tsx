import {AppIcon} from "../AppIcon.tsx";
import {HeartButton} from "../generic/HeartButton.tsx";
import {useEffect, useRef, useState} from "react";
import {draggable, dropTargetForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {combine} from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
    attachClosestEdge,
    extractClosestEdge,
    type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import {FaPencil} from "react-icons/fa6";

type Props = {
    name: string,
    projectId: string,
    slug: string,
    iconUrl: string,
    featured: boolean,
    toggleFeatured: (id: string) => void,
    index: number,
}

export function ProjectListItem({name, projectId, iconUrl, featured, toggleFeatured, index}: Props) {
    const ref = useRef<HTMLLIElement>(null);
    const [dragging, setDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
        if (!featured) return;
        const el = ref.current;
        if (!el) return;

        return combine(
            draggable({
                element: el,
                getInitialData: () => ({type: "featured-project", index}),
                onDragStart: () => setDragging(true),
                onDrop: () => setDragging(false),
            }),
            dropTargetForElements({
                element: el,
                canDrop: ({source}) => source.data.type === "featured-project",
                getIsSticky: () => true,
                getData: ({input, element}) =>
                    attachClosestEdge({index}, {input, element, allowedEdges: ["top", "bottom"]}),
                onDrag: ({self, source}) => {
                    const edge = extractClosestEdge(self.data);
                    const from = source.data.index as number;
                    const isNoop =
                        from === index ||
                        (edge === "top" && from === index - 1) ||
                        (edge === "bottom" && from === index + 1);
                    setClosestEdge(isNoop ? null : edge);
                },
                onDragLeave: () => setClosestEdge(null),
                onDrop: () => setClosestEdge(null),
            }),
        );
    }, [index, featured]);

    return (
        <li ref={ref} className={`relative py-2 w-full select-none ${dragging ? "opacity-20" : ""}`} draggable={featured}>
            {closestEdge && (
                <div
                    className={`absolute left-0 right-0 h-0.5 bg-blue-500 pointer-events-none z-10 ${
                        closestEdge === "top" ? "top-0" : "bottom-0"
                    }`}
                />
            )}
            <div className={`flex items-center gap-2 py-1 px-2 rounded-md bg-neutral-200 ${featured ? "cursor-grab" : ""}`}>
                <AppIcon uri={iconUrl} width={30} />
                <span>{name}</span>
                <div className="flex items-center gap-4 ml-auto">
                    <a
                        href={`/dashboard/project/${projectId}`}
                        target="_blank"
                        className="p-1 rounded-md hover:bg-neutral-300 hover:text-r-blue-700"
                    >
                        <FaPencil />
                    </a>
                    <HeartButton active={featured} toggle={() => toggleFeatured(projectId)} />
                </div>
            </div>
        </li>
    );
}