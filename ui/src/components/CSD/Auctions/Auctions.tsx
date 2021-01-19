import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import { useStreamQueries } from "@daml/react";
import React, { useMemo } from "react";
import BasePage from "../../BasePage/BasePage";
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

let CSDAuctions: React.FC = () => {
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

  return (
    <BasePage routes={CSDRoutes} activeRoute="Auctions">
      <div className="page-subheader">
        <div className="page-subheader-text"> Auctions </div>
      </div>
      <TabContainer />
      <div className="csd-settlements-table-container table-container">
        <table className="base-table csd-settlements-table">
          <thead>
            <tr>
              <th scope="col">Invoice No.</th>
              <th scope="col">Payor</th>
              <th scope="col">Discount</th>
              <th scope="col">Invoice Amount</th>
              <th scope="col">Issued</th>
              <th scope="col">Payment Due</th>
              <th scope="col">Transfer Date</th>
              <th scope="col">Reference No.</th>
            </tr>
          </thead>
          <tbody>{auctionRows}</tbody>
        </table>
      </div>
    </BasePage>
  );
};

export default CSDAuctions;
