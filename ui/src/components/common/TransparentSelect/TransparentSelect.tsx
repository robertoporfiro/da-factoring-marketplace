import React, { InputHTMLAttributes } from "react";
import ExpandMore from "../../../assets/ExpandMore.svg";
import "./TransparentSelect.css";

export interface TransparentSelectProps extends React.ComponentProps<"select"> {
  label: string;
  className?: string;
  icon?: string;
}
export const TransparentSelect: React.FC<TransparentSelectProps> = ({
  children,
  label,
  className,
  icon,
  ...selectProps
}: TransparentSelectProps) => {
  return (
    <div className={`transparent-select-container ${className}`}>
      <div className="transparent-select-label">{label}</div>
      <div className="transparent-select-parent">
        <select
          className={`transparent-select ${(className+"-select") ?? ""}`}
          {...selectProps}
        >
          {children}
        </select>
        <div className="transparent-select-button">
          <img className="expand-profile-button" src={ExpandMore} />
        </div>
      </div>
    </div>
  );
};
