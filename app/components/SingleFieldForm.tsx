import { useState } from "react";
import { CSS_CLASSES } from "~/code/front/CssClasses";

interface FormInputProps {
    name: string;
    initialValue?: string;
    inputType?: React.InputHTMLAttributes<HTMLInputElement>['type'];
    errors?: string;
    onSubmit: (value: string) => void;
    disabled?: boolean;
}

export default function SingleFieldForm(props: FormInputProps) {
    const [value, setValue] = useState(props.initialValue || "");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        props.onSubmit(value);
        setValue(props.initialValue || "");
    };
    
    const buttonClass = props.disabled ? CSS_CLASSES.BUTTON_DISABLED : CSS_CLASSES.SUBMIT_BUTTON;

    return (
        <form>
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
                className={buttonClass}
                type="submit"
                onClick={handleSubmit}
                disabled={props.disabled == true}
            >
                Submit
            </button>
        </form>
    );
}