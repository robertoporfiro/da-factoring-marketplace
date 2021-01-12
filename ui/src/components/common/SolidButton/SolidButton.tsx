import React, { InputHTMLAttributes } from "react";

import "./SolidButton.css";

export interface SolidButtonProps extends React.ComponentProps<"button"> {
  label: string;
  className: string;
  icon?: string;
}
export const SolidButton: React.FC<SolidButtonProps> = ({
  label,
  className,
  icon,
  ...buttonProps
}: SolidButtonProps) => {
  return (
    <button className={`solid-button ${className}`} {...buttonProps}>
      {icon !== null && <img alt="" src={icon}></img>}
      <div>{label}</div>
    </button>
  );
};
