import {createContext} from "react";

export type ModalButton = {
    variant: "default" | "danger" | "subtle",
    id: string
    text: string;
}

export type ModalInteraction = {
    headline?: string,
    body?: string,
    buttons: ModalButton[]
}

export type ModalContextValue = {
    dispatchModal: (modal: ModalInteraction) => Promise<string>,
    dispatchImage: (url: string, altText: string) => Promise<string>,
}

export const  ModalContext = createContext<ModalContextValue | null>(null)
