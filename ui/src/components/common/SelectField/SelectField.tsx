import React, { PropsWithChildren, useEffect, useRef, useState } from "react";

import "../InputField/InputField.scss";
import "./SelectField.scss";

export interface SelectFieldProps
  extends React.InputHTMLAttributes<HTMLSelectElement> {
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
