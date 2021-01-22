import React from "react";

import "./GraphCard.css";
interface GraphCardProps {
  header: string;
  className?: string;
}
const GraphCard: React.FC<GraphCardProps> = (props) => {
  return (
    <div className={`graph-card ${props.className ?? ""}`}>
      <div className="graph-header">{props.header}</div>
      <div className="graph-contents">{props.children}</div>
    </div>
  );
};

export default GraphCard;
