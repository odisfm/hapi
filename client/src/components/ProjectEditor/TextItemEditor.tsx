import { TiDelete } from "react-icons/ti";
import { IoMdAddCircle } from "react-icons/io";
import {useCallback, useEffect, useRef, useState} from "react";

const liStyles = `bg-neutral-200 px-2 py-1 flex rounded-lg`

export function TextItemEditor({items, setItems, validator, placeholder}: {
    items: string[], setItems: (value: string[]) => void, validator: (value: string) => boolean, placeholder: string
}) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [inputFocus, setInputFocus] = useState(false)
    const [inputValid, setInputValid] = useState(true)

    function removeItem(index: number): void {
        setItems(items.toSpliced(index, 1))
    }

    const addItem = useCallback(() => {
        if (!inputRef.current?.value) return
        const value = inputRef.current?.value
        if (!inputValid) return;
        setItems([...items, value])
        inputRef.current!.value = ""
    }, [items, setItems, inputValid])

    function validate(value: string) {
        if (!value) return setInputValid(true)
        setInputValid(validator(value))
    }

    useEffect(() => {
        if (!inputRef.current || !inputFocus) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                addItem()
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [inputFocus, addItem])

    return (
        <div className={`flex flex-col gap-2`}>
            <ul className={`flex flex-wrap gap-2`}>
                {items.map((item, index) => {
                    return (
                        <li key={index} className={liStyles}>
                            <span className={`mr-2`}>{item}</span>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className={`hover:bg-red-600 hover:text-white cursor-pointer p-0.5 rounded-md`}
                            >
                                <TiDelete />
                            </button>
                        </li>
                    )
                })}
                <div className={`flex gap-2 items-center justify-end`}>
                    <input
                        className={`bg-neutral-200 rounded-md px-2 py-1 box-border ${!inputValid && `border-1 border-red-700`}`}
                        placeholder={placeholder}
                        ref={inputRef}
                        onFocus={() => setInputFocus(true)}
                        onBlur={() => setInputFocus(false)}
                        onChange={(e) => validate(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => addItem()}
                        className={`p-1 rounded-md bg-r-blue-700 hover:bg-r-blue text-white cursor-pointer`}

                    >
                        <IoMdAddCircle />
                    </button>
                </div>
            </ul>
        </div>
    )
}
