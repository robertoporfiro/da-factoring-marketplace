import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  useLayoutEffect(() => {
    if (inputRef && touched) {
      const valididty = inputRef.current?.validity;
      setValid(valididty.valid);
    } else {
      setValid(true);
    }
  }, [setValid, inputRef.current?.validity?.valid, inputProps.value, touched]);
  const handleFocus = (e) => {
    inputProps.onFocus && inputProps.onFocus(e);
    if (!touched) {
      setTouched(true);
    }
  };
  return (
    <div className={`input-field ${!valid && "input-field-invalid"}`}>
      <label htmlFor={name}>{label}</label>
      <DebounceInput
        id={name}
        name={name}
        inputRef={inputRef}
        onFocus={handleFocus}
        {...inputProps}
      />
    </div>
  );
};
