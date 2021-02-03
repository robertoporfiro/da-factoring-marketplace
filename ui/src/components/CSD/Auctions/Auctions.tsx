import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useStreamQueries } from "@daml/react";
import React, { useMemo } from "react";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import AuctionsView from "../../common/Auctions/AuctionsView";
import { FactoringRole } from "../../common/FactoringRole";
import { formatAsCurrency } from "../../common/utils";
import CSDRoutes from "../CSDRoutes";

import "./Auctions.css";

const TabContainer = () => {
  return (
    <div className="tab-container">
      <div className="tab-item active-tab-item">Auction Settlements</div>
    </div>
  );
};

const CSDAuctions: React.FC<IBasePageProps> = (props) => {
  /*
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

  const auctionRows = useMemo(() => {
    return auctions.map((auction) => (
      <tr>
        <td>{auction.invoices[0].invoiceNumber}</td>
        <td>{auction.invoices[0].payer}</td>
        <td>{"4.0%"}</td>
        <td>{formatAsCurrency(auction.invoices[0].amount)}</td>
        <td>
          {new Date(auction.invoices[0].issueDate ?? "").toLocaleDateString()}
        </td>
        <td>
          {new Date(auction.invoices[0].dueDate ?? "").toLocaleDateString()}
        </td>
        <td>10/25/2020</td>
        <td>123456789</td>
      </tr>
    ));
  }, [auctions]);
*/
  return (
    <AuctionsView
      userRole={FactoringRole.CSD}
      routes={CSDRoutes}
      showSortSelector={false}
      activeRoute="Auctions"
      {...props}
    />
  );
};

export default CSDAuctions;
