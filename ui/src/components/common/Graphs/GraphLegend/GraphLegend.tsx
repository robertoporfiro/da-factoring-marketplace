import React from "react";

import "./GraphLegend.css";
interface GraphLegendProps {
  className?: string;
}
export const GraphLegend: React.FC<GraphLegendProps> = (props) => {
  return (
    <div className={`graph-legend ${props.className ?? ""}`}>
      {props.children}
    </div>
  );
};

interface GraphLegendItemProps {
  indicatorColor: string;
  label: string;
  data: string;
}
export const GraphLegendItem: React.FC<GraphLegendItemProps> = (props) => {
  return (
    <div className="graph-legend-item">
      <div
        className="graph-legend-indicator"
        style={{
          backgroundColor: props.indicatorColor,
        }}
      ></div>
      <div className="graph-legend-label">{props.label}</div>
      <div className="graph-legend-data">{props.data}</div>
    </div>
  );
};
