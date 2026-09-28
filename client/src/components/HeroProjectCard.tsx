import type {ProjectPreviewType} from "@hapi/shared/types/project";
import {AppIcon} from "./AppIcon.tsx";
import {Button} from "./generic/Button.tsx";
import {useNavigate} from "react-router";
import {MEDIA_BUCKET_URL} from "./MediaCarousel.tsx";

type Props = {
    project: ProjectPreviewType
}

export function HeroProjectCard(
    {
        project,
    }: Props) {
    const navigate = useNavigate()

    const useHeroArt = project.heroArtUrl !== undefined

    return (
        <div className="grid grid-rows-[minmax(0,1fr)_60px] rounded-xl overflow-hidden h-full max-h-[300px]">
            <div className={`bg-neutral-300`}>
                { useHeroArt &&
                    <img
                        src={`${MEDIA_BUCKET_URL}${project.heroArtUrl}.webp`}
                        className={`h-full w-full object-cover object-[50%_52%] min-h-[250px]`}
                    />
                }
                { !useHeroArt &&
                    <div className={`grid grid-cols-[2fr_1fr] gap-4 h-full py-12 pl-12 pr-6`}>
                        <div className={`flex flex-col gap-2 self-center`}>
                            <h3 className={`text-2xl font-bold`}>{project.name}</h3>
                            <span>
                                {project.subtitle}
                            </span>
                        </div>
                        <div className={`flex items-center justify-center self-center`}>
                            <AppIcon uri={project.iconUrl} width={100} />
                        </div>
                    </div>
                }

            </div>
            <div className={`${useHeroArt ? `bg-neutral-300` : `bg-neutral-300`}`}>
                <div className={`flex gap-4 items-center px-4 h-full`}>
                    { useHeroArt &&
                        <>
                            <div className={`flex items-center justify-center`}>
                                <AppIcon uri={project.iconUrl} width={40}/>
                            </div>
                            <div className={`grid grid-cols-1 grid-rows-[1fr_1fr] h-full gap-0.5`}>
                        <span className={`mt-auto text-sm truncate`}>
                            {project.name}
                        </span>
                                <span className={`text-xs font-light`}>
                            {project.subtitle}
                        </span>
                            </div>
                        </>
                    }
                    <Button
                        variant={"hero"}
                        styles={`ml-auto text-xs !min-w-0 !px-4 !py-2`}
                        onClick={() => {navigate(`/project/${project.slug}`)}}
                    >
                        VIEW
                    </Button>
                </div>
            </div>
        </div>
    )
}