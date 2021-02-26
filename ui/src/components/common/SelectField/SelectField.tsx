import React, {
  InputHTMLAttributes,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { DebounceInput, DebounceInputProps } from "react-debounce-input";
import "../InputField/InputField.css";
import "./SelectField.css";

export interface SelectFieldProps
  extends DebounceInputProps<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLSelectElement>
  > {
  label: string;
  name: string;
}
export const SelectField: React.FC<PropsWithChildren<SelectFieldProps>> = ({
  name,
  label,
  children,
  ...inputProps
}) => {
  const [valid, setValid] = useState(true);
  const inputRef = useRef<HTMLSelectElement>();
  useEffect(() => {
    if (inputRef) {
      if (!inputRef.current.validity.valid) {
        setValid(false);
      } else {
        setValid(true);
      }
    }
  }, [setValid]);
  return (
    <div className={`input-field ${!valid && "input-field-invalid"}`}>
      <label htmlFor={name}>{label}</label>
      <select
        className="input-field-select"
        id={name}
        name={name}
        ref={inputRef}
        {...inputProps}
      >
        {children}
      </select>
    </div>
  );
};
