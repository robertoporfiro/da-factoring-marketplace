import React, { InputHTMLAttributes } from "react";
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
  return (
    <div className="input-field">
      <label htmlFor={name}>{label}</label>
      <DebounceInput id={name} name={name} {...inputProps} />
    </div>
  );
};
