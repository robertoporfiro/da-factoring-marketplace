import React from "react";

import "./GraphLegend.css";
interface GraphLegendProps {
  className?: string;
  compact?: boolean;
}
export const GraphLegend: React.FC<GraphLegendProps> = (props) => {
  return (
    <div
      className={`graph-legend ${
        props.compact ?? false ? "graph-legend-compact" : ""
      } ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  );
};

interface GraphLegendItemProps {
  indicatorColor: string;
  label: string;
  data: string;
  compact?: boolean;
}
export const GraphLegendItem: React.FC<GraphLegendItemProps> = (props) => {
  return (
    <div
      className={`graph-legend-item ${
        props.compact ?? false ? "graph-legend-item-compact" : ""
      }`}
    >
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
