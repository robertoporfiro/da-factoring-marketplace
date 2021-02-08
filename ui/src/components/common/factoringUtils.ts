import { Bid } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import Ledger from "@daml/ledger";

export const endAuction = async (ledger: Ledger, auction: Auction) => {
  try {
    await ledger.exerciseByKey(Auction.Auction_End, auction.id, {});
  } catch (e) {}
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
  } else return null;
};

export const sumOfAuctionInvoices = (auction: Auction) => {
  if (auction && auction.invoices.length > 0) {
    return auction.invoices.map((x) => +x.amount).reduce((a, b) => a + b, 0);
  } else return 0;
};
