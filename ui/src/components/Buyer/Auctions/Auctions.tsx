import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import BasePage from "../../BasePage/BasePage";
import BuyerRoutes from "../BuyerRoutes";

import "./Auctions.css";

let BuyerAuctions: React.FC = () => {
  let data1 = {
    datasets: [
      {
        borderWidth: 0,
        data: [10, 20, 30],
        backgroundColor: ["#ffa726", "#8d63cc", "#7bc5f1"],
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Purchased", "Winning", "Bidding"],
  };
  let data2 = {
    datasets: [
      {
        borderWidth: 0,
        data: [20, 20, 20],
        backgroundColor: ["#ffa726", "#8d63cc", "#7bc5f1"],
      },
    ],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["1", "2", "3"],
  };
  const buyerGraphsContainer = (
    <div className="buyer-graphs-container">
      <div className="buyer-graph-card">
        <div className="buyer-graph-card-header">
          Total Invoice Notional Value
        </div>

        <div className="buyer-graph-container">
          <Doughnut
            data={data1}
            options={{
              responsive: true,
              aspectRatio: 1,
              maintainAspectRatio: false,
              legend: { display: false },
            }}
          />
        </div>
      </div>
      <div className="buyer-graph-card">
        <div className="buyer-graph-card-header">Projected P&amp;L</div>
        <div className="buyer-graph-container">
          <Doughnut
            data={data1}
            options={{
              responsive: true,
              aspectRatio: 1,
              maintainAspectRatio: false,
              legend: { display: false },
            }}
          />
        </div>
      </div>
      <div className="buyer-graph-card">
        <div className="buyer-graph-card-header">Auction Wins</div>
        <div className="buyer-graph-container">
          <Bar
            data={data2}
            options={{
              scales: {
                xAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                  },
                ],
                yAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                  },
                ],
              },
              legend: { display: false },
            }}
          ></Bar>
        </div>
      </div>
      <div className="buyer-graph-card">
        <div className="buyer-graph-card-header">Receivables</div>
        <div className="buyer-graph-container">
          <Bar
            data={data2}
            options={{
              scales: {
                xAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                  },
                ],
                yAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                  },
                ],
              },
              legend: { display: false },
            }}
          ></Bar>
        </div>
      </div>
    </div>
  );
  return (
    <BasePage routes={BuyerRoutes} activeRoute="">
      <div className="page-subheader">
        <div className="page-subheader-text"> Auctions </div>
      </div>
      {/*buyerGraphsContainer*/}
      <div className="invoice-status-sort-selector-list">
        <div className="invoice-status-sort-selector">
          <div className="invoice-status-sort-placeholder">✓</div>
          Live
        </div>
        <div className="invoice-status-sort-selector">
          <div className="invoice-status-sort-placeholder">✓</div>
          Winning
        </div>
        <div className="invoice-status-sort-selector">
          <div className="invoice-status-sort-placeholder">✓</div>
          Outbid
        </div>
        <div className="invoice-status-sort-selector">
          <div className="invoice-status-sort-placeholder">✓</div>
          Won
        </div>
        <div className="invoice-status-sort-selector">
          <div className="invoice-status-sort-placeholder">✓</div>
          Lost
        </div>
      </div>
      <div className="buyer-invoices-table-container">
        <table className="base-table buyer-invoices-table">
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Invoice No.</th>
              <th scope="col">Payor</th>
              <th scope="col">Amount</th>
              <th scope="col">Highest Bid</th>
              <th scope="col">Discount</th>
              <th scope="col">My Bid</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="auction-status auction-status-Live">Live</div>
              </td>
              <td>ST2E</td>
              <td>Here is company name</td>
              <td>$22,000</td>
              <td>$20,900</td>
              <td>2.5%</td>
              <td>$20,100</td>
              <td>08/30/2020</td>
              <td>
                <button className="outline-button">Place Bid</button>
              </td>
            </tr>
            <tr>
              <td>
                <div className="auction-status auction-status-Live">Live</div>
              </td>
              <td>ST23</td>
              <td>Here is company name</td>
              <td>$25,100</td>
              <td>$20,100</td>
              <td>2.5%</td>
              <td>$20,200</td>
              <td>08/30/2020</td>
              <td>
                <button className="outline-button">Place Bid</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BasePage>
  );
};

export default BuyerAuctions;
