import { useState } from "react";
import { CSS_CLASSES } from "~/code/front/CssClasses";

interface TwoFieldFormProps {
  inputFieldName: string;
  initialValue?: string;
  inputType?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  errors?: {
    inputField?: string;
    roleField?: string;
  };
  onSubmit: (values: { inputField: string; roleField: string }) => void;
  disabled?: boolean;
}

export default function TwoFieldForm(props: TwoFieldFormProps) {
  const [inputField, setInputField] = useState(props.initialValue || "");
  const [roleField, setRoleField] = useState("owner");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputField(event.target.value);
    // Email validation using a simple regex
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!event.target.value.match(emailPattern)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(null);
    }
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleField(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit({ inputField, roleField });
    setInputField(props.initialValue || "");
    setRoleField("owner");
  };

  const buttonClass = props.disabled
    ? CSS_CLASSES.BUTTON_DISABLED
    : CSS_CLASSES.SUBMIT_BUTTON;

  return (
    <form onSubmit={handleSubmit}>
      {/* Input Field (e.g. username) */}
      <label className={CSS_CLASSES.LABEL} htmlFor={props.inputFieldName}>
        {props.inputFieldName.charAt(0).toUpperCase() +
          props.inputFieldName.slice(1)}
      </label>
      <input
        className={CSS_CLASSES.INPUT_FIELD}
        type={props.inputType || "text"}
        id={props.inputFieldName}
        name={props.inputFieldName}
        value={inputField}
        onChange={handleInputChange}
        disabled={props.disabled}
      />
      {emailError && <p className={CSS_CLASSES.ERROR_CLASS}>{emailError}</p>}
      {props.errors?.inputField && (
        <p className={CSS_CLASSES.ERROR_CLASS}>{props.errors.inputField}</p>
      )}

      {/* Role Dropdown */}
      <label className={CSS_CLASSES.LABEL} htmlFor="roleField">
        Role
      </label>
      <select
        className={CSS_CLASSES.INPUT_FIELD}
        id="roleField"
        name="roleField"
        value={roleField}
        onChange={handleRoleChange}
        disabled={props.disabled}
      >
        <option value="owner">Owner</option>
        <option value="contributor">Contributor</option>
      </select>
      {props.errors?.roleField && (
        <p className={CSS_CLASSES.ERROR_CLASS}>{props.errors.roleField}</p>
      )}

      {/* Submit Button */}
      <button className={buttonClass} type="submit" disabled={props.disabled}>
        Submit
      </button>
    </form>
  );
}
