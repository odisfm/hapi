type Props = {
    pageCount: number
    activePage: number
    setPage: (page: number) => void
}

const styles = `p-1 text-xs cursor-pointer rounded-full h-6 w-6 flex items-center justify-center `
const inactiveStyles = `cursor-pointer bg-neutral-400 text-white`
const activeStyles = `font-bold bg-r-blue text-white`

export function Paginator({pageCount, activePage, setPage}: Props) {
    return (
        <nav className={`flex gap-3 w-full justify-center min-h-10`}>
            {new Array(pageCount).fill(null).map((_, i: number) => {
                return (
                    <button
                        type="button"
                        onClick={() => setPage(i)}
                        className={`${styles} ${i === activePage ? `${activeStyles}` : `${inactiveStyles}`}`}
                    >
                        {i + 1}
                    </button>
                )
            })}
        </nav>
    )
}
