import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useStreamQueries } from "@daml/react";
import React, { useMemo } from "react";
import BasePage from "../../BasePage/BasePage";
import CSDRoutes from "../CSDRoutes";

import "./Dashboard.css";

const CSDDashboard: React.FC = () => {
  const auctionContracts = useStreamQueries(
    Auction,
    () => [],
    [],
    (e) => {
      console.log("Unexpected close from Auction: ", e);
    }
  ).contracts;

  const auctions = useMemo(() => {
    return auctionContracts.map((auctionContract) => auctionContract.payload);
  }, [auctionContracts]);

  return (
    <BasePage routes={CSDRoutes} activeRoute="Dashboard">
      <div className="page-subheader">
        <div className="page-subheader-text"> Dashboard </div>
      </div>
      <div className="csd-graphs-container"></div>
    </BasePage>
  );
};

export default CSDDashboard;
