import React from "react";
import BasePage from "../../BasePage/BasePage";
import BrokerRoutes from "../BrokerRoutes";

import "./Invoices.css";

let BrokerInvoices: React.FC = () => {
  return (
    <BasePage routes={BrokerRoutes} activeRoute="Inventory">
      <div className="page-subheader">
        <div className="page-subheader-text"> Invoices </div>
      </div>
      <div className="broker-invoices-table-container">
        <table className="base-table broker-invoices-table">
          <thead>
            <tr>
              <th scope="col">
                <input type="checkbox"></input>
              </th>
              <th scope="col">Invoice No.</th>
              <th scope="col">Payor</th>
              <th scope="col">Seller</th>
              <th scope="col">Amount</th>
              <th scope="col">Discount</th>
              <th scope="col">Issued</th>
              <th scope="col">Payment Due</th>
              <th scope="col"> </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input className="base-checkbox" type="checkbox"></input>
              </td>
              <td>ST23</td>
              <td>Here is company name</td>
              <td>Roberto</td>
              <td>$25,800</td>
              <td>2.5%</td>
              <td>08/25/2020</td>
              <td>09/25/2020</td>
              <td>
                <button className="outline-button">Send to Auction</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BasePage>
  );
};

export default BrokerInvoices;
