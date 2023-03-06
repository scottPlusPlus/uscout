import { useState } from "react";
import { CSS_CLASSES } from "~/code/CssClasses";

interface FormInputProps {
    name: string;
    initialValue?: string;
    inputType?: React.InputHTMLAttributes<HTMLInputElement>['type'];
    errors?: string;
    onSubmit: (value: string) => void;
}

export default function SingleFieldForm(props: FormInputProps) {
    const [value, setValue] = useState(props.initialValue || "");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        props.onSubmit(value);
    };

    return (
        <form className="bg-gray-100 rounded-md shadow-md p-4">
            <label className={CSS_CLASSES.LABEL} htmlFor={props.name}>
                {props.name.charAt(0).toUpperCase() + props.name.slice(1)}
            </label>
            <input
                className={CSS_CLASSES.INPUT_FIELD}
                type={props.inputType || "text"}
                id={props.name}
                name={props.name}
                value={value}
                onChange={handleInputChange}
            />
            {props.errors && <p className={CSS_CLASSES.ERROR_CLASS}>{props.errors}</p>}
            <button
                className={CSS_CLASSES.SUBMIT_BUTTON}
                type="submit"
                onClick={handleSubmit}
            >
                Submit
            </button>
        </form>
    );
}