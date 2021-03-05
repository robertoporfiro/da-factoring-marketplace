import { AssetDeposit } from "@daml.js/daml-factoring/lib/DA/Finance/Asset";
import { Id } from "@daml.js/daml-factoring/lib/DA/Finance/Types";
import { BrokerCustomerBuyer } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { Auction, Bid } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import {
  useLedger,
  useParty,
  useStreamFetchByKeys,
  useStreamQueries,
} from "@daml/react";
import { ContractId } from "@daml/types";
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import BasePage, { IBasePageProps } from "../../../BasePage/BasePage";
import { useOperator } from "../../common";
import { FactoringRole } from "../../FactoringRole";
import {
  brokerCancelBid,
  brokerPlaceBid,
  buyerCancelBid,
  buyerPlaceBid,
  decodeAuctionIdPayload,
  getAuctionMinPrice,
  getBidderNameFromRegistry,
  getCurrentBestBid,
  sumOfAuctionInvoices,
} from "../../factoringUtils";
import { InputField } from "../../InputField/InputField";
import { useRegistryLookup } from "../../RegistryLookup";
import { SelectField } from "../../SelectField/SelectField";
import { SolidButton } from "../../SolidButton/SolidButton";
import {
  BASE_CURRENCY,
  daysLeftFromDateString,
  decimalToPercent,
  decimalToPercentString,
  formatAsCurrency,
} from "../../utils";

import "./BidsView.css";
interface BidsViewProps extends IBasePageProps {
  historicalView?: boolean;
  userRole: FactoringRole;
}
const BidsView: React.FC<BidsViewProps> = (props): JSX.Element => {
  const registry = useRegistryLookup();
  const history = useHistory();
  const ledger = useLedger();
  const currentParty = useParty();
  const operator = useOperator();
  const brokerCustomerBuyerContracts = useStreamQueries(BrokerCustomerBuyer)
    .contracts;
  const assetDepositContracts = useStreamQueries(AssetDeposit).contracts.filter(
    (x) => x.payload.asset.id.label === BASE_CURRENCY
  );
  const brokerBuyers = useMemo(
    () => brokerCustomerBuyerContracts.map((c) => c?.payload?.brokerCustomer),
    [brokerCustomerBuyerContracts]
  );
  const assetDeposits = useMemo(() => {
    return assetDepositContracts.filter(
      (x) => x.payload.account.owner === currentParty
    );
  }, [assetDepositContracts, currentParty]);

  const funds = useMemo(() => {
    if (assetDepositContracts && assetDepositContracts.length > 0) {
      const assetDepositSum =
        assetDepositContracts.length > 0
          ? assetDepositContracts
              .map((x) => +x.payload.asset.quantity)
              .reduce((a, b) => +a + +b, 0)
          : 0;
      const brokerBuyerSum =
        brokerCustomerBuyerContracts.length > 0
          ? brokerCustomerBuyerContracts
              .map((x) => +x.payload.currentFunds)
              .reduce((a, b) => +a + +b, 0)
          : 0;
      if (props.userRole === FactoringRole.Buyer) {
        return assetDepositSum;
      } else if (props.userRole === FactoringRole.Broker) {
        return +assetDepositSum - +brokerBuyerSum;
      }
    } else {
      return 0;
    }
  }, [assetDepositContracts, brokerCustomerBuyerContracts, props.userRole]);

  const [state, setState] = useState({
    currentAuctionAmount: 0,
    currentPrice: 1,
    onBehalfOf: currentParty,
    currentAllowedFunds: Number.MAX_SAFE_INTEGER,
  });

  const [currentBestBid, setCurrentBestBid] = useState("0 %");
  let { auctionIdPayload } = useParams<{ auctionIdPayload: string }>();
  const [auctionId, setAuctionId] = useState<Id>();

  useEffect(() => {
    const fetchAuction = async () => {
      const auctionIdDecoded = decodeAuctionIdPayload(auctionIdPayload);
      const auctionContract = await ledger.fetchByKey(
        Auction,
        auctionIdDecoded
      );
      if (auctionContract) {
        setAuctionId(auctionContract.payload.id);
      }
    };
    if (!auctionId) {
      fetchAuction();
    }
  }, [auctionId, auctionIdPayload, ledger]);

  const auctionKeyQueryFactory = () => {
    if (auctionId) {
      return [auctionId];
    } else {
      return [];
    }
  };
  const auctionContractsByAuctionId = useStreamFetchByKeys(
    Auction,
    auctionKeyQueryFactory,
    [auctionId]
  ).contracts;
  const auction = useMemo(() => {
    if (auctionContractsByAuctionId[0]) {
      return auctionContractsByAuctionId[0].payload;
    }
  }, [auctionContractsByAuctionId]);
  const invoice = useMemo(() => {
    return auction?.invoice;
  }, [auction]);

  const bids = useMemo(
    () => auction?.bids.sort((a, b) => +b.price - +a.price) ?? [],
    [auction]
  );

  const historicalViewOnly = useMemo(() => {
    if (
      props.historicalView ??
      (false || props.userRole === FactoringRole.Seller)
    ) {
      return true;
    } else {
      if (auction && auction.status === "AuctionOpen") {
        return false;
      } else {
        return true;
      }
    }
  }, [auction, props.historicalView, props.userRole]);

  useEffect(() => {
    if (state.currentAuctionAmount === 0 && invoice) {
      setState({
        ...state,
        currentAuctionAmount: +invoice?.amount ?? 0,
      });
    } else if (auction) {
      if (+state.currentAuctionAmount < +auction.bidIncrement) {
        setState({
          ...state,
          currentAuctionAmount: +auction.bidIncrement,
        });
      }
    }
  }, [auction, invoice, state]);

  useEffect(() => {
    if (auction) {
      setCurrentBestBid(
        decimalToPercentString(getCurrentBestBid(auction)?.price ?? 1.0)
      );
    }
  }, [auction]);

  useEffect(() => {
    console.log("funds hook running");
    if (
      props.userRole === FactoringRole.Buyer ||
      (props.userRole === FactoringRole.Broker &&
        state.onBehalfOf === currentParty)
    ) {
      setState((currentState) => {
        return {
          ...currentState,
          currentAllowedFunds: funds,
        };
      });
    } else if (
      props.userRole === FactoringRole.Broker &&
      state.onBehalfOf !== currentParty
    ) {
      const brokerCustomerFunds = brokerCustomerBuyerContracts.find(
        (c) => c.payload.brokerCustomer === state.onBehalfOf
      ).payload.currentFunds;
      setState((currentState) => {
        return { ...currentState, currentAllowedFunds: +brokerCustomerFunds };
      });
    }
  }, [
    brokerCustomerBuyerContracts,
    currentParty,
    funds,
    props.userRole,
    state.onBehalfOf,
  ]);

  const isPooledAuction = invoice?.included?.length > 0 ?? false;

  const handleInvalid = (e: FormEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    if (name === "bidAmount") {
      let bidAmount = +value;
      if (bidAmount > +state.currentAllowedFunds) {
        target.setCustomValidity("Insufficient Funds.");
      }
    }
  };

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    if (name === "bidAmount") {
      let bidAmount = +value;
      if (bidAmount > +state.currentAuctionAmount) {
        target.setCustomValidity(
          "Bid amount cannot be more than auction amount."
        );
      }
      if (bidAmount > +state.currentAllowedFunds) {
        target.setCustomValidity("Insufficient Funds.");
      }
      setState({
        ...state,
        currentPrice: bidAmount / state.currentAuctionAmount,
      });
    } else if (name === "auctionAmount") {
      const auctionAmount = +value;
      if (auctionAmount % (+auction?.bidIncrement ?? 1) !== 0) {
        target.setCustomValidity(
          "Auction amount must be a multiple of bid increment"
        );
      } else if (auctionAmount > sumOfAuctionInvoices(auction)) {
        target.setCustomValidity(
          "Auction amount must not be greater than invoice amount"
        );
      } else {
        target.setCustomValidity("");
        setState({
          ...state,
          currentAuctionAmount: auctionAmount,
        });
      }
    } else if (name === "discount") {
      const discount = +value;
      if (!(discount > 0.0)) {
        target.setCustomValidity("Enter a valid discount rate");
      } else {
        target.setCustomValidity("");
        setState({
          ...state,
          currentPrice: 1.0 - discount * 0.01,
        });
      }
    } else {
      setState({ ...state, [name]: value });
    }
  };

  const cancelBid = async (bid: Bid) => {
    if (props.userRole === FactoringRole.Buyer) {
      await buyerCancelBid(ledger, operator, currentParty, bid);
    } else if (props.userRole === FactoringRole.Broker) {
      await brokerCancelBid(ledger, operator, currentParty, bid);
    }
  };

  const onPlaceBidSubmit = async () => {
    if (props.userRole === FactoringRole.Buyer) {
      await buyerPlaceBid(
        ledger,
        operator,
        currentParty,
        auction.id,
        [...assetDeposits.map((c) => c.contractId)],
        state.currentAuctionAmount * state.currentPrice,
        state.currentAuctionAmount
      );
    } else if (props.userRole === FactoringRole.Broker) {
      await brokerPlaceBid(
        ledger,
        operator,
        currentParty,
        state.onBehalfOf,
        auction.id,
        [...assetDeposits].map((c) => c.contractId),
        state.currentAuctionAmount * state.currentPrice,
        state.currentAuctionAmount
      );
    }
    setState({
      ...state,
      onBehalfOf: currentParty,
      currentAuctionAmount: 0,
      currentPrice: 1,
    });
  };
  const bidsHeaders = (
    <tr>
      <th scope="col">Rate</th>
      <th scope="col">Auction Amount</th>
      <th scope="col">Bid Amount</th>
      {auction?.status === "AuctionClosed" && (
        <th scope="col">Quantity Filled</th>
      )}
      <th scope="col">Bidder Name</th>
      <th scope="col"></th>
    </tr>
  );

  const bidsList = bids.map((bid) => (
    <tr key={bid.orderId}>
      <td>
        <div>{decimalToPercentString(bid.price)}</div>
      </td>
      <td>{formatAsCurrency(+bid.amount)}</td>
      <td>{formatAsCurrency(+bid.amount * +bid.price)}</td>
      {auction.status === "AuctionClosed" && (
        <td>{formatAsCurrency(+bid.quantityFilled)}</td>
      )}

      <td>
        {bid.buyer === currentParty ||
        bid.onBehalfOf === currentParty ||
        props.userRole === FactoringRole.Exchange ||
        props.userRole === FactoringRole.CSD
          ? getBidderNameFromRegistry(
              registry,
              bid.onBehalfOf ?? bid.buyer,
              false
            )
          : getBidderNameFromRegistry(
              registry,
              bid.onBehalfOf ?? bid.buyer,
              true
            )}
      </td>
      <td>
        {bid.buyer === currentParty && auction.status === "AuctionOpen" && (
          <SolidButton
            label="✖"
            className="cancel-bid-button"
            onClick={async () => {
              await cancelBid(bid);
            }}
          />
        )}
        {bid.status === "BidWon" && <div className="bid-won-tick">✓</div>}
      </td>
    </tr>
  ));

  const InvoiceDetailSection = (label, data) => (
    <div className="invoice-detail-section" key={label + data}>
      <div className="invoice-detail-section-label">{label}</div>
      <div className="invoice-detail-section-data">{data}</div>
    </div>
  );
  const PlaceBidInfoItem = (label, data) => (
    <div className="place-bid-info-item" key={label + data}>
      <div className="place-bid-info-item-label">{label}</div>
      <div className="place-bid-info-item-data">{data}</div>
    </div>
  );
  return (
    <BasePage activeRoute="" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Place a Bid </div>
        <Link
          className="back-to-auction-link"
          to={"#"}
          onClick={(e) => {
            e.preventDefault();
            history.goBack();
          }}
        >
          ⟵ Back to All Auctions
        </Link>
      </div>
      <div
        className={`${
          historicalViewOnly ?? false
            ? "historical-bids-container"
            : "place-bid-container"
        }`}
      >
        <div className="invoice-details-card">
          <div>
            <div className="invoice-details-card-header">Invoice Details</div>
            {[
              InvoiceDetailSection("Invoice #", invoice?.invoiceNumber),
              InvoiceDetailSection("Payor", invoice?.payer),
              InvoiceDetailSection(
                "Issue Date",
                new Date(invoice?.issueDate ?? "").toLocaleDateString()
              ),
              InvoiceDetailSection(
                "Due Date",
                new Date(invoice?.dueDate ?? "").toLocaleDateString()
              ),
              InvoiceDetailSection(
                "Amount",
                formatAsCurrency(invoice?.amount ?? 0)
              ),
              InvoiceDetailSection(
                "Bid Increment",
                formatAsCurrency(+auction?.bidIncrement)
              ),
              props.userRole !== FactoringRole.Buyer &&
                props.userRole !== FactoringRole.Broker &&
                InvoiceDetailSection(
                  "Max Discount Rate",
                  decimalToPercentString(getAuctionMinPrice(auction) ?? 1)
                ),
            ]}
          </div>
          {isPooledAuction && (
            <div>
              <div className="invoice-details-card-header">
                Pool Auction Details
              </div>

              <div className="table-container">
                <table className="base-table pooled-invoice-details-table">
                  <thead>
                    <tr>
                      <th scope="col">Invoice No.</th>
                      <th scope="col">Payor</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice?.included.map((includedInvoice) => (
                      <tr key={includedInvoice.invoiceId}>
                        <td>{includedInvoice.invoiceNumber}</td>
                        <td>{includedInvoice.payer}</td>
                        <td>{formatAsCurrency(includedInvoice.amount)}</td>
                        <td>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {!(historicalViewOnly ?? false) && (
          <div className="place-bid-card">
            <div className="place-bid-info-section">
              {[
                PlaceBidInfoItem("Current Best Bid", currentBestBid),
                PlaceBidInfoItem(
                  "Auction End",
                  auction
                    ? daysLeftFromDateString(new Date(auction?.endDate))
                    : ""
                ),
              ]}
            </div>

            <form
              onSubmit={(e) => {
                onPlaceBidSubmit();

                e.preventDefault();
              }}
              className="place-bid-form"
            >
              <div className="dual-input-field">
                {props.userRole === FactoringRole.Broker && (
                  <>
                    <SelectField
                      name="onBehalfOf"
                      value={state.onBehalfOf}
                      onChange={handleChange}
                      label="On behalf of"
                      required
                    >
                      <option value={currentParty}>Self</option>
                      {brokerBuyers.map((s) => (
                        <option value={s}>{`${getBidderNameFromRegistry(
                          registry,
                          s,
                          false
                        )}`}</option>
                      ))}
                    </SelectField>
                  </>
                )}

                <InputField
                  required
                  label="Auction Amount ($)"
                  name="auctionAmount"
                  placeholder="e.g. 100000"
                  min={+auction?.bidIncrement ?? 0}
                  max={sumOfAuctionInvoices(auction)}
                  onChange={handleChange}
                  value={state.currentAuctionAmount.toFixed(2)}
                  debounceTimeout={2000}
                />
              </div>
              <div className="bid-price-fields">
                <InputField
                  required
                  type="number"
                  label="Discount Rate (%)"
                  name="discount"
                  placeholder="e.g. 5"
                  min="0.01"
                  step="0.01"
                  max="99.9999999999"
                  onChange={handleChange}
                  value={`${((1.0 - state.currentPrice) * 100).toFixed(2)}`}
                  debounceTimeout={2000}
                />
                <div className="or">
                  <div>or</div>
                </div>
                <InputField
                  required
                  label="Bid Amount ($)"
                  type="number"
                  name="bidAmount"
                  placeholder="e.g. 10000"
                  max={Math.min(
                    state.currentAuctionAmount ?? 0,
                    state.currentAllowedFunds ?? 0
                  ).toFixed(2)}
                  onChange={handleChange}
                  onInvalid={handleInvalid}
                  value={(
                    state.currentAuctionAmount * state.currentPrice
                  ).toFixed(2)}
                  debounceTimeout={2000}
                  step={auction?.bidIncrement ?? 0}
                />
              </div>
              <div className="expected-return-section">
                <div className="expected-return-section-label">
                  Expected Return
                </div>
                <div className="expected-return-section-data">
                  {formatAsCurrency(
                    +(
                      state.currentAuctionAmount -
                      state.currentAuctionAmount * state.currentPrice
                    ) || 0
                  )}
                </div>
              </div>
              <SolidButton
                type="submit"
                className="place-bid-button"
                label="Place Bid"
              />
            </form>
          </div>
        )}
        <div className="bid-history-card table-container">
          <div className="bid-history-card-header">Bid History</div>
          <table className="base-table bid-history-table">
            <thead>{bidsHeaders}</thead>
            <tbody>{bidsList}</tbody>
          </table>
        </div>
      </div>
    </BasePage>
  );
};

export default BidsView;
