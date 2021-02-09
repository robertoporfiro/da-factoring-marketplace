import React from "react";

import "./GraphCard.css";
interface GraphCardProps {
  header: string;
  className?: string;
  showControls?: boolean;
  subheader?: JSX.Element;
}
const GraphCard: React.FC<GraphCardProps> = (props) => {
  return (
    <div className={`graph-card ${props.className ?? ""}`}>
      {props.showControls && (
        <div className="graph-controls">
          <div>D</div>
          <div>W</div>
          <div>M</div>
          <div>YTD</div>
        </div>
      )}
      <div className="graph-header">{props.header}</div>
      {props.subheader && (
        <div className="graph-subheader">{props.subheader}</div>
      )}
      <div className="graph-contents">{props.children}</div>
    </div>
  );
};

export default GraphCard;
