import {useState} from "react";
import {FaSearch} from "react-icons/fa";
import {MdCancel} from "react-icons/md";
import {Button} from "../../../components/generic/Button.tsx";
import {useProjectSearchParams} from "../../../hooks/useProjectSearchParams.ts";

/** Search box for the project search. Submitting writes the term to the URL's `q` param. */
export function SearchBar() {
    const [searchQuery, updateQuery] = useProjectSearchParams();
    const searchTerm = searchQuery.searchTerm ?? "";
    const [text, setText] = useState<string>(searchTerm);

    // keep the box in step when the term changes from outside, e.g. back/forward or a link
    const [syncedTerm, setSyncedTerm] = useState<string>(searchTerm);
    if (searchTerm !== syncedTerm) {
        setSyncedTerm(searchTerm);
        setText(searchTerm);
    }

    return (
        <form className={`flex items-center gap-2`} role={"search"} onSubmit={(e) => {
            e.preventDefault();
            updateQuery({searchTerm: text.trim() || undefined});
        }}>
            <input
                name={"searchBar"}
                aria-label={"Search projects"}
                className={`bg-neutral-200 rounded-lg p-2 flex-1`}
                placeholder={"search by project name, description, developers"}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            {text.length > 0 &&
                <Button
                    buttonType={"button"}
                    styles={`!p-3`}
                    onClick={() => {
                        setText("");
                        updateQuery({searchTerm: undefined});
                    }}
                >
                    <MdCancel/>
                </Button>
            }
            <Button
                buttonType={"submit"}
                color={"red"}
                styles={`hover:!bg-r-yellow-500`}
            >
                <FaSearch />
                <span>Search</span>
            </Button>
        </form>
    )
}