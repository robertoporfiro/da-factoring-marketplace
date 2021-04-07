import React from "react";
import "./OutlineRoleBox.scss";

interface OutlineBoxProps {
  role: string;
}
const OutlineRoleBox: React.FC<OutlineBoxProps> = (props: { role: string }) => {
  const { role } = props;
  return (
    <>
      <div className="outline-role-box">{role}</div>
    </>
  );
};
export default OutlineRoleBox;
