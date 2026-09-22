import {type ReactNode, useEffect} from "react";
import {monitorForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

const ulStyles = `w-2/3`


export function ProjectList({children, reorder}: {
    children: ReactNode,
    reorder: (sourceIndex: number, targetIndex: number) => void
}) {
    useEffect(() => {
        return monitorForElements({
            onDrop({source, location}) {
                const target = location.current.dropTargets[0];
                if (!target) return;

                const sourceIndex = source.data.index as number;
                const targetIndex = target.data.index as number;
                if (sourceIndex === targetIndex) return;

                reorder(sourceIndex, targetIndex);
            }
        });
    }, [reorder]);
    return (
        <ul
            className={ulStyles}
        >
            {children}
        </ul>
    )
}