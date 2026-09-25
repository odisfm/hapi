import type {ReactNode} from "react";
import {FaSpinner} from "react-icons/fa";

type ButtonVariant = "hero" | "default" | "compact"
type ButtonColors = "blue" | "mid-blue" | "light-blue" | "red" | "danger" | "yellow" | "subtle" | "grey" | "default"

type ButtonProps = {
    children?: ReactNode;
    variant?: ButtonVariant;
    color?: ButtonColors;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
    buttonType?: "button" | "submit" | "reset" | undefined
    loading?: boolean;
    active?: boolean;
    styles?: string;
    activeStyles?: string;
    inactiveStyles?: string;
    disabledStyles?: string;
    ariaLabel?: string;
}

export function Button(
    {
        children,
        onClick,
        variant = "default",
        color = "blue",
        loading = false,
        buttonType = "button",
        disabled = false,
        active = false,
        styles = "",
        activeStyles = "",
        inactiveStyles = "",
        disabledStyles = "",
        ariaLabel
    }
    : ButtonProps): ReactNode {

    let buttonStyles = `${(!disabled && !loading) ? `cursor-pointer` : `cursor-not-allowed opacity-85`}  
        font-copy flex items-center justify-center text-center transition-colors duration-50 `
    let colorStyles = ``
    const shouldHover = !active && !disabled
    switch (variant) {
        case "hero":
            buttonStyles += `min-w-48 shrink-0 rounded-full px-16 py-3
                             font-bold uppercase gap-4 `
            break;
        case "default":
            buttonStyles += `px-4 py-2 rounded-md text-md gap-4 `
            break;
        case "compact":
            buttonStyles += `px-2 py-1 text-sm rounded-md gap-2 `
            break;
    }

    switch (color) {
        case "blue":
        case "default":
        default:
            colorStyles += ` bg-r-blue ${shouldHover && `hover:bg-r-blue-700`} text-white`
            break;
        case "mid-blue":
            colorStyles += ` bg-r-blue-700 ${shouldHover && `hover:bg-r-blue-500`} text-white`
            break;
        case "light-blue":
            colorStyles += ` bg-r-blue-500 text-white ${shouldHover && `hover:bg-r-blue-700 `}`
            break;
        case "red":
            colorStyles += ` bg-r-red text-white ${shouldHover && `hover:bg-neutral-200 hover:text-black`} `
            break
        case "danger":
            colorStyles += ` bg-red-700 text-white ${shouldHover && `hover:bg-red-600`} `
            break
        case "yellow":
            colorStyles += ` bg-r-yellow-500 text-black ${shouldHover && `hover:bg-r-yellow-400`} `
            break
        case "grey":
            colorStyles += ` bg-neutral-300 text-black ${shouldHover && `hover:bg-neutral-200`} `
            break;
        case "subtle":
            colorStyles += ` bg-transparent text-black border-transparent border-1 
            ${shouldHover && `hover:bg-black/5 hover:border-black/10`} `
    }

    return (
        <button
            type={buttonType}
            disabled={disabled}
            aria-label={ariaLabel}
            onClick={(e) => {
                if (!onClick) return
                onClick(e)
            }}
            className={`
            ${styles} ${active ? activeStyles : inactiveStyles} ${buttonStyles} ${colorStyles} 
            ${disabled && disabledStyles} 
            `}
        >
            {children}
            {loading && <FaSpinner className={`animate-spin`}/>}
        </button>
    )
}
