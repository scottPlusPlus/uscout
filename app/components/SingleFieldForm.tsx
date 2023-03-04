import { useState } from "react";

const LABEL_CLASS = "block font-bold text-gray-700 mb-2";
const INPUT_CLASS =
    "border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2";
const ERROR_CLASS = "text-red-500 text-sm italic mb-2";
const SUBMIT_BUTTON_CLASS =
    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline";

interface FormInputProps {
    name: string;
    errors?: string;
    onSubmit: (value: string) => void;
}

export default function SingleFieldForm(props: FormInputProps) {
    const [value, setValue] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        props.onSubmit(value);
    };

    return (
        <form className="bg-gray-100 rounded-md shadow-md p-4">
            <label className={LABEL_CLASS} htmlFor={props.name}>
                {props.name.charAt(0).toUpperCase() + props.name.slice(1)}
            </label>
            <input
                className={INPUT_CLASS}
                type="text"
                id={props.name}
                name={props.name}
                value={value}
                onChange={handleInputChange}
            />
            {props.errors && <p className={ERROR_CLASS}>{props.errors}</p>}
            <button
                className={SUBMIT_BUTTON_CLASS}
                type="submit"
                onClick={handleSubmit}
            >
                Submit
            </button>
        </form>
    );
}