import { ModalContext, type ModalInteraction, type ModalButton } from "./ModalContext.tsx";
import {useState, useCallback, useEffect} from "react";
import {createUuid} from "../../utils/misc.ts";
import {Button} from "../../components/generic/Button.tsx";

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
                                return (
                                    <Button
                                        key={b.id}
                                        color={b.variant}

                                        onClick={() => handleButtonClick(m.id, b.id, m.resolve)}
                                    >
                                        {b.text}
                                    </Button>
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
