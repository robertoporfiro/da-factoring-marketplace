import React from "react";

import "./OutlineButton.scss";

export interface OutlineButtonProps extends React.ComponentProps<"button"> {
  label: string;
  className?: string;
}
export const OutlineButton: React.FC<OutlineButtonProps> = ({
  label,
  className,
  ...buttonProps
}: OutlineButtonProps) => {
  return (
    <button className={`outline-button ${className ?? ""}`} {...buttonProps}>
      <div>{label}</div>
    </button>
  );
};
