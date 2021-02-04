import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";

export const getCurrentBestBid = (auction: Auction) => {
  if (auction && auction.bids.length > 0) {
    const sorted = auction.bids.sort((b, a) => +a.price - +b.price);
    return sorted[0];
  } else return null;
};

export const sumOfAuctionInvoices = (auction: Auction) => {
  return auction.invoices.map((x) => +x.amount).reduce((a, b) => a + b, 0);
};
