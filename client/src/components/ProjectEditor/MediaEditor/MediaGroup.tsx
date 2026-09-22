import type {ProjectMediaType} from "@hapi/shared/types/projectMedia";
import {useEffect} from "react";
import {monitorForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {extractClosestEdge} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import {MediaTile} from "./MediaTile.tsx";
import type {DeviceType} from "@hapi/shared/prisma/enums";

type Props = {
    media: ProjectMediaType[]
    onReorder: (deviceType: DeviceType, sourceIdx: number, targetIdx: number) => void
    deviceType: DeviceType
    setActiveMedia: (media: ProjectMediaType) => void
}

export function MediaGroup({media, onReorder, deviceType, setActiveMedia}: Props) {
    useEffect(() => {
        return monitorForElements({
            onDrop({source, location}) {
                const target = location.current.dropTargets[0];
                if (!target) return;

                const sourceIndex = source.data.index as number;
                const targetIndex = target.data.index as number;
                if (sourceIndex === targetIndex) return;

                const edge = extractClosestEdge(target.data);
                const next = [...media];
                const [moved] = next.splice(sourceIndex, 1);

                let insertAt = targetIndex;
                if (sourceIndex < targetIndex && edge === "left") insertAt -= 1;
                if (sourceIndex > targetIndex && edge === "right") insertAt += 1;

                next.splice(insertAt, 0, moved);
                onReorder(deviceType, sourceIndex, targetIndex);
            }
        });
    }, [media, onReorder, deviceType]);

    return (
        <div className={`flex flex-col gap-1`}>
            <div className={`flex flex-wrap gap-2`}>
                {media.map((m, i) => (
                    <MediaTile key={m.order} media={m} index={i} setActiveMedia={setActiveMedia}/>
                ))}
            </div>
            {media.length === 0 &&
            <span>No screenshots for this device.</span>
            }
        </div>
    )
}