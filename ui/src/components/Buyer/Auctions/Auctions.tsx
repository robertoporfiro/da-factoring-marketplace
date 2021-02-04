import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";

import AuctionsView from "../../common/Auctions/AuctionsView/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";

import "./Auctions.css";

const BuyerAuctions: React.FC<IBasePageProps> = (props) => {
  return <AuctionsView userRole={FactoringRole.Buyer} {...props} />;
};

export default BuyerAuctions;
