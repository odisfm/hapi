import {useCallback, useEffect, useRef, useState} from "react";
import type {CategoryResponse, CategoryType} from "@hapi/shared/types/apiResponses";
import {FaSpinner} from "react-icons/fa";
import {useModal} from "../../contexts/modal/useModal.ts";
import {API_URL} from "../../consts.ts";
import {CategoryItem} from "./CategoryItem.tsx";
import type {CategoryCreateRequestType, CategoryUpdateRequestType} from "@hapi/shared/types/apiRequests";
import {IoMdAddCircle} from "react-icons/io";
import {Button} from "../generic/Button.tsx";
import {throwErrorFromResponse} from "../../utils/misc.ts";

export function CategoryEditor() {
    const modalContext = useModal();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const newCategoryInputRef = useRef<HTMLInputElement>(null);

    const getCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/category`, {
                method: "GET",
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            const json: CategoryResponse = await res.json();
            setCategories(json.categories)
        } catch (e) {
            console.error(e);
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        } finally {
            setLoading(false);
        }
    }, [modalContext])

    useEffect(() => {
        (async () => {
            await getCategories();
        })()
    }, [getCategories])

    const deleteCategory = useCallback(async (id: string) => {
        const confirm = await modalContext.dispatchModal({
            headline: "Delete category?",
            body: `Delete category ${categories.find((c) => c.id === id)!.name}?\n
            All projects will be dissociated immediately.`,
            buttons: [
                {id: "cancel", text: "Cancel", variant: "default"},
                {id: "confirm", text: "Delete", variant: "danger"}
            ]
        })
        if (confirm !== "confirm") {
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/category/${id}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            await getCategories();
        } catch (e) {
            console.error(e);
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        } finally {
            setLoading(false);
        }
    }, [modalContext, getCategories, categories])

    const renameCategory = useCallback(async (id: string, name: string) => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/category/${id}`, {
                method: "PATCH",
                credentials: "include",
                body: JSON.stringify({ name } satisfies CategoryUpdateRequestType),
            })
            if (!res.ok) {
                console.error(res)
                await throwErrorFromResponse(res)
            }
            await getCategories();
        } catch (e) {
            console.error(e);
            await modalContext.dispatchModal({
                headline: "Error",
                body: String(e)
            })
        } finally {
            setLoading(false);
        }
    }, [modalContext, getCategories])

    const submitNewCategory =
        useCallback(async (e: React.SubmitEvent<HTMLFormElement>) => {
            const formData = new FormData(e.target)
            let newName = formData.get("categoryName")
            if (!newName) return
            newName = String(newName)
            try {
                setLoading(true)
                const res = await fetch(`${API_URL}/category`, {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        name: newName,
                    } satisfies CategoryCreateRequestType),
                })
                if (!res.ok) {
                    console.error(res)
                    await throwErrorFromResponse(res)
                }
                await getCategories();
                if (newCategoryInputRef.current) {
                    newCategoryInputRef.current.value = ""
                }
            }
            catch (e) {
                console.error(e);
                await modalContext.dispatchModal({
                    headline: "Error",
                    body: String(e)
                })
            } finally {
                setLoading(false);
            }
    }, [modalContext, getCategories])

    return (
        <>
            <div className={`flex items-center gap-2`}>
                <h3 className={`font-bold text-3xl uppercase`}>Categories</h3>
                {loading && <FaSpinner className={`animate-spin text-xl`}/> }
            </div>
            <ul className={`grid grid-cols-1 md:grid-cols-3 gap-2 pt-4`}>
                {categories.map((c) => {
                    return (
                        <CategoryItem
                            data={c}
                            deleteFn={deleteCategory}
                            renameFn={renameCategory}
                            key={c.id}
                        />
                    )
                })}
            </ul>
            <h4 className={`mt-6 mb-2 font-bold uppercase text-xl`}>Add category</h4>
            <form
                className={`flex items-center gap-2`}
                onSubmit={(e) => {
                    e.preventDefault();
                    submitNewCategory(e)
                }}
            >
                <input
                    className={`bg-neutral-200 rounded-md p-1.5`}
                    ref={newCategoryInputRef}
                    name={"categoryName"}
                />
                <Button
                    buttonType={"submit"}
                    ariaLabel={"submit"}
                >
                    <IoMdAddCircle />
                </Button>
            </form>
        </>
    )
}