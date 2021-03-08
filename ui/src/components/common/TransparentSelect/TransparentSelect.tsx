import React from "react";
import { PropsWithChildren } from "react";
import ExpandMore from "../../../assets/ExpandMore.svg";
import "./TransparentSelect.css";

export interface TransparentSelectProps extends React.ComponentProps<"select"> {
  label: string;
  className?: string;
  icon?: string;
}
export const TransparentSelect: React.FC<
  PropsWithChildren<TransparentSelectProps>
> = ({ children, label, className, icon, ...selectProps }) => {
  return (
    <div className={`transparent-select-container ${className}`}>
      <div className="transparent-select-label">{label}</div>
      <div className="transparent-select-parent">
        <select
          className={`transparent-select ${className + "-select" ?? ""}`}
          {...selectProps}
        >
          {children}
        </select>
        {/*
            <div className="transparent-select-button">
              <img
                className="expand-profile-button"
                alt="Select Item"
                src={ExpandMore}
              />
            </div>
         */}
      </div>
    </div>
  );
};
