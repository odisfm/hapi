import {useState} from "react";
import type {FormEvent} from "react";
import {MdSearch} from "react-icons/md";
import {useNavigate} from "react-router";

const quickLinks = ["Health", "Education", "Workplace", "Games"];

export default function SearchOverlay({onClose}: {onClose: () => void}) {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState("");

    function submitSearch(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        navigate(`/search?q=${encodeURIComponent(inputValue)}`);
        onClose();
    }

    function searchQuickLink(term: string): void {
        navigate(`/search?q=${encodeURIComponent(term)}`);
        onClose();
    }

    return (
        <>
            <div className={`absolute inset-x-0 top-full z-20 h-[22.5rem] bg-r-blue px-4 pb-8 pt-20 text-white`}>
                <form onSubmit={submitSearch} className={`mx-auto flex w-full max-w-[calc(64rem+2rem)] translate-x-[2%] items-center gap-3 sm:translate-x-[5%]`}>
                    <button type="submit" aria-label="Submit search" className={`text-4xl hover:text-r-red`}>
                        <MdSearch />
                    </button>
                    <input
                        type="search"
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        placeholder="Search Hub of Apple Platform Innovation @ RMIT"
                        className={`min-w-0 flex-1 bg-transparent text-2xl text-white outline-none placeholder:text-white/75`}
                    />
                </form>
                <div className={`mx-auto mt-16 w-full max-w-[calc(64rem+2rem)] translate-x-[2%] sm:translate-x-[5%]`}>
                    <p className={`font-semibold`}>Quick Links</p>
                    <div className={`mt-1 flex flex-col items-start gap-1`}>
                        {quickLinks.map((term) => (
                            <button
                                key={term}
                                type="button"
                                onClick={() => searchQuickLink(term)}
                                className={`text-white hover:text-r-red`}
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <button
                type="button"
                aria-label="Close search"
                onClick={onClose}
                className={`absolute inset-x-0 top-full z-10 min-h-screen bg-black/50`}
            />
        </>
    );
}