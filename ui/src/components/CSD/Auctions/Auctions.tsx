import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";
import AuctionsView from "../../common/Auctions/AuctionsView/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";
import CSDRoutes from "../CSDRoutes";

import "./Auctions.scss";

const CSDAuctions: React.FC<IBasePageProps> = (props) => {
  return (
    <AuctionsView
      userRole={FactoringRole.CSD}
      routes={CSDRoutes}
      showSortSelector={true}
      activeRoute="Auctions"
      {...props}
    />
  );
};

export default CSDAuctions;
