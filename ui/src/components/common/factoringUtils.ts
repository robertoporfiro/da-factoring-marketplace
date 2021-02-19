import { Broker } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { Bid, Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Operator } from "@daml.js/daml-factoring/lib/Marketplace/Operator";
import { LedgerParties } from "@daml.js/daml-factoring/lib/Script/Factoring";
import Ledger from "@daml/ledger";
import { ContractId, Party } from "@daml/types";
import { wrapDamlTuple } from "./damlTypes";

export const endAuction = async (ledger: Ledger, auction: Auction) => {
  try {
    await ledger.exerciseByKey(Auction.Auction_End, auction.id, {});
  } catch (e) {}
};

export const sendPoolToAuction = async (
  ledger: Ledger,
  operator: Party,
  currentParty: Party,
  invoices: Invoice[],
  minimumQuantity,
  minimumProceeds,
  bidIncrement,
  endDate,
  invoiceNumber
) => {
  try {
    await ledger.exerciseByKey(
      Broker.Broker_SendPoolToAuction,
      wrapDamlTuple([operator, currentParty]),
      {
        invoices: invoices,
        minimumQuantity: (+minimumQuantity).toFixed(2),
        minimumProceeds: (+minimumProceeds).toFixed(2),
        bidIncrement: (+bidIncrement).toFixed(2),
        endDate: new Date(endDate).toISOString(),
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(endDate).toISOString().slice(0, 10),
        invoiceNumber: invoiceNumber ?? "",
      }
    );
  } catch (e) {}
};

export const sendToAuction = async (
  ledger: Ledger,
  invoice: Invoice,
  minimumQuantity,
  minimumProceeds,
  bidIncrement,
  endDate
) => {
  try {
    await ledger.exerciseByKey(
      Invoice.Invoice_SendToAuction,
      wrapDamlTuple([invoice.csd, invoice.seller, invoice.invoiceId]),
      {
        minimumQuantity: (+minimumQuantity).toFixed(2),
        minimumProceeds: (+minimumProceeds).toFixed(2),
        bidIncrement: (+bidIncrement).toFixed(2),
        endDate: new Date(endDate).toISOString(),
      }
    );
  } catch (e) {
    console.log("Error while sending invoice to auction.");
    console.error(e);
  }
};

export const getAuctionMinPrice = (auction: Auction) => {
  if (auction) {
    return +auction.minProceeds / +auction.bidIncrement;
  } else return null;
};
export const getCurrentBestBid = (auction: Auction): Bid => {
  if (auction && auction.bids.length > 0) {
    const sorted = auction.bids.sort((b, a) => +a.price - +b.price);
    return sorted[0];
  } else return null;
};
export const getCurrentBestBidParty = (auction: Auction, party: string) => {
  if (auction && auction.bids.length > 0) {
    const sorted = auction.bids
      .filter((b) => b.buyer === party)
      .sort((b, a) => +a.price - +b.price);
    return sorted[0];
  } else return undefined;
};

export const sumOfAuctionInvoices = (auction: Auction) => {
  if (auction && auction.invoice) {
    return auction.invoice.amount;
  } else return 0;
};
