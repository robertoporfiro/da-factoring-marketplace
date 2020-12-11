import React from "react";

import "./InvoiceCard.css";
import Exit from "../../../assets/Exit.svg";

export enum InvoiceStatusEnum {
  Live = "Live",
  Open = "Open",
  Sold = "Sold",
  Paid = "Paid",
}

export interface InvoiceCardProps {
  invoiceStatus: InvoiceStatusEnum;
  invoiceNumber: string;
  payerName: string;
  discountRate?: string;
  issuedDate: string;
  invoiceAmount: string;
  paymentDueDate: string;
  latestBid?: string;
  latestDiscountRate?: string;
  auctionEndDate?: string;
  auctionSoldDate?: string;
  auctionPaidDate?: string;
  contractId: any;
  onSendToAuction: (contractId) => void;
}

let InvoiceCard: React.FC<InvoiceCardProps> = (props: InvoiceCardProps) => {
  const invoiceStatus = props.invoiceStatus.toString();

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className={`invoice-card invoice-card-status-${invoiceStatus}`}>
      <div className="invoice-card-invoice-info-area">
        <div
          className={`invoice-status-indicator invoice-status-${invoiceStatus}`}
        >
          {invoiceStatus}
        </div>
        <div className="invoice-number">
          <div className="data-label invoice-number-label">Invoice No.</div>
          <div className="data-text invoice-number-data">
            {props.invoiceNumber}
          </div>
        </div>
        <div className="payer">
          <div className="data-label payer-lavel">Payer</div>
          <div className="data-text payer-data">{props.payerName}</div>
        </div>
        <div className="discount">
          {props.invoiceStatus !== InvoiceStatusEnum.Open &&
            props.discountRate !== null && (
              <>
                <div className="data-label discount-label">Discount</div>
                <div className="data-text discount-data">
                  {props.discountRate}
                </div>
              </>
            )}
        </div>
        <div className="issued">
          <div className="data-label issued-label">Issued</div>
          <div className="data-text issued-data">{props.issuedDate}</div>
        </div>
        <div className="invoice-amount">
          <div className="data-label invoice-amount-label">Invoice Amount</div>
          <div className="data-text invoice-amount-data">
            {`${currencyFormatter.format(Number(props.invoiceAmount))}`}
          </div>
        </div>
        <div className="payment-due">
          <div className="data-label payment-due-label">Payment Due</div>
          <div className="data-text payment-due-data">
            {props.paymentDueDate}
          </div>
        </div>
      </div>

      <div className="invoice-card-action-info-area">
        {props.invoiceStatus === InvoiceStatusEnum.Open && (
          <>
            <div className="open-auction-actions">
              <button
                className="auction-action-button"
                onClick={async () => {
                  await props.onSendToAuction(props.contractId);
                }}
              >
                <img className="auction-action-button-icon" src={Exit}></img>
                Send To Auction
              </button>
              <button className="auction-action-button">
                <img className="auction-action-button-icon" src={Exit}></img>
                Send To Broker
              </button>
            </div>
          </>
        )}
        {props.invoiceStatus != InvoiceStatusEnum.Open && (
          <>
            <div className="latest-bid">
              <div className="data-label latest-bid-label">Latest Bid</div>
              <div className="data-text latest-bid-data">
                {/*props.latestBid*/ "$15,000"}
              </div>
            </div>
            <div className="latest-discount-rate">
              <div className="data-label latest-discount-rate-label">
                Latest Discount Rate
              </div>
              <div className="data-text latest-discount-rate-data">
                {/*props.latestDiscountRate*/ "4.00%"}
              </div>
            </div>
            <div className="invoice-status">
              <div className="data-label invoice-status-label">Auction End</div>
              <div className="data-text invoice-status-data">23 days left</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;
