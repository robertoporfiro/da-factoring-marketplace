import { Auction } from "@daml.js/da-marketplace/lib/Factoring/Invoice";

export const getCurrentBestBid = (auction: Auction) => {
  if (auction && auction.bids.length > 0) {
    const sorted = auction.bids.sort((b, a) => +a.price - +b.price);
    return sorted[0];
  }
};
