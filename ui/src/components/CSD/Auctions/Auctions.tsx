import React from "react";
import BasePage from "../../BasePage/BasePage";
import CSDRoutes from "../CSDRoutes";

import "./Auctions.css";

const TabContainer = () => {
  return (
    <div className="tab-container">
      <div className="tab-item active-tab-item">Auction Settlements</div>
      <div className="tab-item">Payment Received</div>
    </div>
  );
};

let CSDAuctions: React.FC = () => {
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
          <tbody>
            <tr>
              <td>ST23</td>
              <td>Here is company name</td>
              <td>4.0%</td>
              <td>$25,800</td>
              <td>08/25/2020</td>
              <td>09/25/2020</td>
              <td>10/25/2020</td>
              <td>123456789</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BasePage>
  );
};

export default CSDAuctions;
