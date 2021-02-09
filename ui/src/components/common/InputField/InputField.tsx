import React, { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import { DebounceInput, DebounceInputProps } from "react-debounce-input";

import "./InputField.css";

export interface InputFieldProps
  extends DebounceInputProps<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  > {
  label: string;
  name: string;
}
export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  ...inputProps
}) => {
  const [valid, setValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>();
  useEffect(() => {
    if (inputRef) {
      if (!inputRef.current.validity.valid) {
        setValid(false);
      } else {
        setValid(true);
      }
    }
  });
  return (
    <div className={`input-field ${!valid && "input-field-invalid"}`}>
      <label htmlFor={name}>{label}</label>
      <DebounceInput
        id={name}
        name={name}
        inputRef={inputRef}
        {...inputProps}
      />
    </div>
  );
};
