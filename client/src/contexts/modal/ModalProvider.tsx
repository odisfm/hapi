import { ModalContext, type ModalInteraction, type ModalButton } from "./ModalContext.tsx";
import {useState, useCallback, useEffect} from "react";
import {createUuid} from "../../utils/misc.ts";

type QueuedModal = ModalInteraction & {
    id: string;
    resolve: (buttonId: string) => void;
};

type QueuedImage = {
    url: string;
    altText: string;
    id: string;
    resolve: (buttonId: string) => void;
}

const buttonStyles = `px-4 py-2 rounded-md cursor-pointer`
const defaultStyles = `bg-r-blue-700 hover:bg-r-blue text-white`
const dangerStyles = `bg-red-700 hover:bg-red-500 text-white`
const subtleStyles = `border-1 border-transparent hover:border-r-blue-500 hover:bg-black/10`

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modals, setModals] = useState<QueuedModal[]>([]);
    const [image, setImage] = useState<QueuedImage | null>(null);

    const dispatchModal = useCallback((modal: ModalInteraction) => {
        return new Promise<string>((resolve) => {
            const id = createUuid();
            setModals((prev) => [...prev, { ...modal, id, resolve }]);
        });
    }, []);

    const dispatchImage = useCallback((url: string, altText: string) => {
        return new Promise<string>((resolve) => {
            const id = createUuid();
            setImage({url, altText, id, resolve});
        });
    }, []);

    useEffect(() => {
        if (!image) return;

        function handleKeyDown(e: unknown) {
            if ((e as React.KeyboardEvent).key === "Escape") {
                setImage(null);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [image]);

    const handleButtonClick = (modalId: string, buttonId: string, resolve: (id: string) => void) => {
        resolve(buttonId);
        setModals((prev) => prev.filter((m) => m.id !== modalId));
    };

    return (
        <ModalContext value={{ dispatchModal, dispatchImage }}>
            {modals.map((m) => (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="relative max-w-[90vw] max-h-[90vh] rounded-lg bg-white p-6 shadow-xl">
                        {m.headline && <h2 className={`text-xl font-bold mb-4`}>{m.headline}</h2>}
                        {m.body && m.body.split("\n").map((p) => {
                            return <p>{p}</p>
                        })
                        }
                        <div className="mt-4 flex gap-2">
                            {m.buttons.map((b: ModalButton) => {
                                let variantStyles
                                switch (b.variant) {
                                    case "default":
                                        variantStyles = defaultStyles
                                        break
                                    case "danger":
                                        variantStyles = dangerStyles
                                        break
                                    case "subtle":
                                        variantStyles = subtleStyles
                                        break
                                }
                                return (
                                    <button
                                        key={b.id}
                                        data-variant={b.variant}
                                        className={`${buttonStyles} ${variantStyles}`}
                                        onClick={() => handleButtonClick(m.id, b.id, m.resolve)}
                                    >
                                        {b.text}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            ))}
            {image &&
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => {
                        setImage(null)
                        image.resolve("")
                    }}
                >
                    <div className="relative rounded-lg bg-white p-6 shadow-xl">
                        <img
                            src={image.url}
                            alt={image.altText}
                            className={`
                                block h-auto w-auto max-h-[calc(90vh-3rem)] max-w-[calc(90vw-3rem)] 
                                object-contain cursor-pointer
                                `}
                        />
                    </div>
                </div>
            }
            {children}
        </ModalContext>
    );
}
