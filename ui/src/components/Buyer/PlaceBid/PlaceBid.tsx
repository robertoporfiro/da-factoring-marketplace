import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import BasePage from "../../BasePage/BasePage";
import BuyerRoutes from "../BuyerRoutes";

import "./PlaceBid.css";

let BuyerPlaceBid: React.FC = () => {
  let invoiceNumber = "TD89";
  let payerName = "Company A";
  let issueDate;
  return (
    <BasePage routes={{}} activeRoute="">
      <div className="page-subheader">
        <div className="page-subheader-text"> Place a Bid </div>
      </div>
      <div className="place-bid-container">
        <div className="invoice-details-card">
          <div className="invoice-details-card-header">Invoice Details</div>
          <div className="invoice-detail-section">
            <div className="invoice-detail-section-label">Invoice #</div>
            <div className="invoice-detail-section-data">{invoiceNumber}</div>
          </div>
          <div className="invoice-detail-section">
            <div className="invoice-detail-section-label">Payer</div>
            <div className="invoice-detail-section-data">{"Company A"}</div>
          </div>
          <div className="invoice-detail-section">
            <div className="invoice-detail-section-label">Issue Date</div>
            <div className="invoice-detail-section-data">{"07/02/2020"}</div>
          </div>
          <div className="invoice-detail-section">
            <div className="invoice-detail-section-label">Payment Date</div>
            <div className="invoice-detail-section-data">{"07/02/2020"}</div>
          </div>
          <div className="invoice-detail-section">
            <div className="invoice-detail-section-label">Amount</div>
            <div className="invoice-detail-section-data">{"$10000"}</div>
          </div>
          <div className="invoice-detail-section">
            <div className="invoice-detail-section-label">
              Min Bid Increment
            </div>
            <div className="invoice-detail-section-data">{"$1,000"}</div>
          </div>
        </div>
        <div className="place-bid-card">
          <div className="base-input-field">
            <label htmlFor="payerName">Payer Name</label>
            <input
              type="text"
              id="payerName"
              name="payerName"
              placeholder="e.g. Jonathan Malka"
            />
          </div>
          <div className="base-input-field">
            <label htmlFor="invoiceAmount">Invoice Amount</label>
            <input
              type="text"
              id="invoiceAmount"
              name="invoiceAmount"
              placeholder="e.g. 100000"
            />
          </div>
          <div className="base-input-field">
            <label htmlFor="invoiceNumber">Invoice Number</label>
            <input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              placeholder="e.g. ab123"
            />
          </div>
        </div>
        <div className="bid-history-card">
          <div className="bid-history-card-header">Bid History</div>
          <table className="base-table broker-users-table">
            <thead>
              <tr>
                <th scope="col">Bids</th>
                <th scope="col">Bid Amount</th>
                <th scope="col">Bidder Name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4.10%</td>
                <td>$300,000</td>
                <td>Bidder Name</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BasePage>
  );
};

export default BuyerPlaceBid;
