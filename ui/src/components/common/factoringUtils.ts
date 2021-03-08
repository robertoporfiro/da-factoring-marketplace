import Ledger from "@daml/ledger";
import { ContractId, Party } from "@daml/types";
import { wrapDamlTuple } from "./damlTypes";
import { Seller } from "@daml.js/daml-factoring/lib/Factoring/Seller";
import {
  Broker,
  BrokerCustomerBuyer,
  BrokerCustomerSeller,
} from "@daml.js/daml-factoring/lib/Factoring/Broker";

import { Bid, Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Auction } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Buyer } from "@daml.js/daml-factoring/lib/Factoring/Buyer";
import { Id } from "@daml.js/daml-factoring/lib/DA/Finance/Types";
import { AssetDeposit } from "@daml.js/daml-factoring/lib/DA/Finance/Asset";
import { RegisteredUser } from "@daml.js/daml-factoring/lib/Factoring/Registry";
import { RegistryLookup } from "./RegistryLookup";
import { FactoringRole } from "./FactoringRole";

export const decodeAuctionIdPayload = (auctionIdPayload: string) => {
  return JSON.parse(atob(auctionIdPayload)) as Id;
};
export const encodeAuctionIdPayload = (auction: Auction) => {
  return btoa(JSON.stringify(auction.id));
};

export const isBrokerBuyerParticipatingInAuction = (
  auction: Auction,
  currentParty: string
): boolean => {
  if (auction) {
    const auctionBidders = [...auction.bids?.flatMap((b) => b.onBehalfOf)];
    if (auctionBidders.includes(currentParty)) {
      return true;
    }
  }
  return false;
};

export const isBrokerSellerParticipatingInAuction = (
  auction: Auction,
  currentParty: string
): boolean => {
  if (auction) {
    const invoiceOwners = [
      ...auction.invoice.included?.flatMap((i) => i.initialOwner),
      auction.invoice.initialOwner,
    ];
    if (invoiceOwners.includes(currentParty)) {
      return true;
    }
  }
  return false;
};

export const isBrokerParticipatingInAuction = (
  auction: Auction,
  currentParty: string
): boolean => {
  if (auction) {
    const invoiceOwners = [
      ...auction.invoice.included?.flatMap((i) => [i.seller, i.initialOwner]),
      auction.invoice.seller,
      auction.invoice.initialOwner,
    ];
    const auctionBidders = [
      ...auction.bids?.flatMap((b) => [b.buyer, b.onBehalfOf]),
    ];
    if (
      invoiceOwners.includes(currentParty) ||
      auctionBidders.includes(currentParty)
    ) {
      return true;
    }
  }
  return false;
};

export const getInvoiceOwnerNameFromRegistry = (
  registry: RegistryLookup,
  party
) => {
  const seller: any = registry.sellerMap.get(party);
  const broker: any = registry.brokerMap.get(party);
  const user = seller ?? broker;

  return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;
};

export const getSellerNameFromRegistry = (registry: RegistryLookup, party) => {
  const user: any = registry.sellerMap.get(party);

  return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;
};

export const getBuyerNameFromRegistry = (registry: RegistryLookup, party) => {
  const user: any = registry.buyerMap.get(party);

  return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;
};
export const getBidderNameFromRegistry = (
  registry: RegistryLookup,
  party,
  censored: boolean
) => {
  const buyer: any = registry.buyerMap.get(party);
  const broker: any = registry.brokerMap.get(party);
  const user = buyer ?? broker;
  if (censored) {
    return user?.firstName.replace(
      user.firstName?.slice(1) ?? "",
      "*".repeat(user?.firstName?.length - 1) ?? ""
    );
  } else {
    return `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;
  }
};
export const userEditProfile = async (
  ledger: Ledger,
  operator,
  currentParty,
  userCompany,
  userFirstName,
  userLastName,
  userEmail
) => {
  try {
    await ledger.exerciseByKey(
      RegisteredUser.RegisteredUser_UpdateProfile,
      { _1: operator, _2: currentParty },
      {
        newCompany: userCompany,
        newFirstName: userFirstName,
        newLastName: userLastName,
        newEmail: userEmail,
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const buyerWithdrawFunds = async (
  ledger: Ledger,
  operator,
  currentParty,
  depositCids,
  withdrawalQuantity: number
) => {
  try {
    await ledger.exerciseByKey(
      Buyer.Buyer_RequestWithdraw,
      wrapDamlTuple([operator, currentParty]),
      {
        depositCids: depositCids,
        withdrawalQuantity: (+withdrawalQuantity).toFixed(2),
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const sellerWithdrawFunds = async (
  ledger: Ledger,
  operator,
  currentParty,
  depositCids,
  withdrawalQuantity: number
) => {
  try {
    await ledger.exerciseByKey(
      Seller.Seller_RequestWithdrawl,
      wrapDamlTuple([operator, currentParty]),
      {
        depositCids: depositCids,
        withdrawalQuantity: (+withdrawalQuantity).toFixed(2),
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const brokerWithdrawFunds = async (
  ledger: Ledger,
  operator,
  currentParty,
  depositCids,
  withdrawalQuantity: number
) => {
  try {
    await ledger.exerciseByKey(
      Broker.Broker_RequestWithdraw,
      wrapDamlTuple([operator, currentParty]),
      {
        depositCids: depositCids,
        withdrawalQuantity: (+withdrawalQuantity).toFixed(2),
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const buyerAllocateFunds = async (
  ledger: Ledger,
  currentParty,
  depositCids,
  amount: number
) => {
  try {
    const brokerBuyerContract = await ledger.query(BrokerCustomerBuyer);
    await ledger.exerciseByKey(
      BrokerCustomerBuyer.BrokerCustomerBuyer_TransferToBroker,
      wrapDamlTuple([brokerBuyerContract[0].payload?.broker, currentParty]),
      {
        depositCids: depositCids,
        transferQuantity: (+amount).toFixed(2),
      }
    );
  } catch (e) {
    console.error(e);
  }
};
export const brokerAddFunds = async (
  ledger: Ledger,
  operator,
  currentParty,
  amount: number
) => {
  try {
    await ledger.exerciseByKey(
      Broker.Broker_RequestDeposit,
      wrapDamlTuple([operator, currentParty]),
      { amount: `${(+amount).toFixed(2)}` }
    );
  } catch (e) {
    console.error(e);
  }
};

export const buyerAddFunds = async (
  ledger: Ledger,
  operator,
  currentParty,
  amount: number
) => {
  try {
    await ledger.exerciseByKey(
      Buyer.Buyer_RequestDeposit,
      wrapDamlTuple([operator, currentParty]),
      { amount: `${(+amount).toFixed(2)}` }
    );
  } catch (e) {
    console.error(e);
  }
};

export const brokerPlaceBid = async (
  ledger: Ledger,
  operator,
  currentParty,
  onBehalfOf,
  auctionId: Id,
  depositCids: ContractId<AssetDeposit>[],
  bidAmount: number,
  auctionAmount: number
) => {
  try {
    await ledger.exerciseByKey(
      Broker.Broker_PlaceBid,
      wrapDamlTuple([operator, currentParty]),
      {
        onBehalfOf: onBehalfOf,
        auctionId: auctionId,
        depositCids: depositCids,
        bidAmount: bidAmount.toFixed(2),
        auctionAmount: auctionAmount.toFixed(2),
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const buyerPlaceBid = async (
  ledger: Ledger,
  operator,
  currentParty,
  auctionId: Id,
  depositCids: ContractId<AssetDeposit>[],
  bidAmount: number,
  auctionAmount: number
) => {
  try {
    await ledger.exerciseByKey(
      Buyer.Buyer_PlaceBid,
      wrapDamlTuple([operator, currentParty]),
      {
        auctionId: auctionId,
        depositCids: depositCids,
        bidAmount: bidAmount.toFixed(2),
        auctionAmount: auctionAmount.toFixed(2),
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const brokerCancelBid = async (
  ledger: Ledger,
  operator,
  currentParty,
  bid: Bid
) => {
  try {
    await ledger.exerciseByKey(
      Broker.Broker_CancelBid,
      wrapDamlTuple([operator, currentParty]),
      {
        bid: bid,
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const buyerCancelBid = async (
  ledger: Ledger,
  operator,
  currentParty,
  bid: Bid
) => {
  try {
    await ledger.exerciseByKey(
      Buyer.Buyer_CancelBid,
      wrapDamlTuple([operator, currentParty]),
      {
        bid: bid,
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const endAuction = async (ledger: Ledger, auction: Auction) => {
  try {
    await ledger.exerciseByKey(Auction.Auction_End, auction.id, {});
  } catch (e) {
    console.error(e);
  }
};

export const sendInvoiceToBroker = async (
  ledger: Ledger,
  broker,
  operator,
  seller,
  invoice: Invoice
) => {
  try {
    await ledger.exerciseByKey(
      BrokerCustomerSeller.BrokerCustomerSeller_SendInvoiceToBroker,
      wrapDamlTuple([broker, operator, seller]),
      {
        invoice,
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const recallInvoiceFromBroker = async (
  ledger: Ledger,
  broker,
  operator,
  seller,
  invoice: Invoice
) => {
  try {
    await ledger.exerciseByKey(
      BrokerCustomerSeller.BrokerCustomerSeller_RetrieveInvoiceFromBroker,
      wrapDamlTuple([broker, operator, seller]),
      {
        invoice,
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const brokerCreateInvoice = async (
  ledger: Ledger,
  operator,
  brokerParty,
  onBehalfOf,
  payer,
  invoiceNumber,
  amount,
  issueDate,
  dueDate
) => {
  try {
    await ledger.exerciseByKey(
      Broker.Broker_AddInvoice,
      wrapDamlTuple([operator, brokerParty]),
      {
        onBehalfOf,
        payer,
        invoiceNumber,
        amount,
        issueDate,
        dueDate,
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const sellerCreateInvoice = async (
  ledger: Ledger,
  operator,
  sellerParty,
  payer,
  invoiceNumber,
  amount,
  issueDate,
  dueDate
) => {
  try {
    await ledger.exerciseByKey(
      Seller.Seller_AddInvoice,
      wrapDamlTuple([operator, sellerParty]),
      {
        payer,
        invoiceNumber,
        amount,
        issueDate,
        dueDate,
      }
    );
  } catch (e) {
    console.error(e);
  }
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
  } catch (e) {
    console.error(e);
  }
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
    console.error(e);
  }
};

export const roleCanBidOnAuctions = (userRole: FactoringRole) => {
  return (
    userRole &&
    (userRole === FactoringRole.Broker || userRole === FactoringRole.Buyer)
  );
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
