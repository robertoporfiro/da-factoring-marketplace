import React from "react";
import { IBasePageProps } from "../../BasePage/BasePage";

import AuctionsView from "../../common/Auctions/AuctionsView";

import "./Auctions.css";

const BuyerAuctions: React.FC<IBasePageProps> = (props) => {
  return <AuctionsView {...props} />;
};

export default BuyerAuctions;
