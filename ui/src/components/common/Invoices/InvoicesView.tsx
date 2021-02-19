import React, { ChangeEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  useLedger,
  useParty,
  useStreamFetchByKeys,
  useStreamQueries,
} from "@daml/react";
import { ContractId } from "@daml/types";
import {
  Auction,
  Invoice,
  InvoiceStatus,
} from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { Seller } from "@daml.js/daml-factoring/lib/Factoring/Seller";
import { BrokerCustomerSeller } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { wrapDamlTuple } from "../damlTypes";
import { useOperator } from "../common";
import { getAuctionMinPrice, getCurrentBestBid } from "../factoringUtils";
import { FactoringRole } from "../FactoringRole";
import { decimalToPercentString, formatAsCurrency } from "../utils";

import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import Add from "../../../assets/Add.svg";
import ArrowDropDown from "../../../assets/ArrowDropDown.svg";
import FilterList from "../../../assets/FilterList.svg";
import { InputField } from "../InputField/InputField";
import { TransparentSelect } from "../TransparentSelect/TransparentSelect";
import { SolidButton } from "../SolidButton/SolidButton";
import InvoiceCard, { InvoiceStatusEnum } from "./InvoiceCard";

import "./InvoicesView.css";

interface InvoicesViewProps extends IBasePageProps {
  role?: FactoringRole;
}

const InvoicesView: React.FC<InvoicesViewProps> = (
  props: InvoicesViewProps
) => {
  const sendToAuctionFormInitialState = {
    minimumQuantity: "0",
    bidIncrement: "0",
    endDate: "",
    contractId: undefined,
    invoice: undefined as Invoice,
  };
  const [newInvoiceFormState, setNewInvoiceFormState] = useState({
    dueDate: "",
    issueDate: "",
    invoiceAmount: "",
    payerName: "",
    invoiceNumber: "",
  });
  const [sendToAuctionFormState, setSendToAuctionFormState] = useState(
    sendToAuctionFormInitialState
  );
  const [currentSortOption, setCurrentSortOption] = useState<any>();
  const [currentSortFunction, setCurrentSortFunction] = useState<any>();
  const [currentFilters, setCurrentFilters] = useState([
    InvoiceStatusEnum.Live,
    InvoiceStatusEnum.Open,
    InvoiceStatusEnum.Paid,
    InvoiceStatusEnum.Sold,
    InvoiceStatusEnum.Pooled,
  ]);
  const [
    sendToAuctionFormMinimumPrice,
    setSendToAuctionFormMinimumPrice,
  ] = useState("0");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);

  const ledger = useLedger();
  const operator = useOperator();
  const currentParty = useParty();

  const mapInvoiceStatusEnum = (damlStatus: InvoiceStatus) => {
    switch (damlStatus.tag) {
      case "InvoiceLive":
        return InvoiceStatusEnum.Live;
      case "InvoiceOpen":
        return InvoiceStatusEnum.Open;
      case "InvoicePaid":
        return InvoiceStatusEnum.Paid;
      case "InvoicePooled":
        return InvoiceStatusEnum.Pooled;
      case "InvoiceSold":
        return InvoiceStatusEnum.Sold;
    }
  };

  //#region  DAML stuff
  const brokerCustomerSellerContracts = useStreamQueries(BrokerCustomerSeller)
    .contracts;
  const invoiceContracts = useStreamQueries(Invoice).contracts;

  const invoiceTokens = useMemo(() => {
    return invoiceContracts
      .filter((i) => i.payload.status.tag !== "InvoiceOpen")
      .map((invoiceContract) => invoiceContract.payload.token);
  }, [invoiceContracts]);

  const auctionContracts = useStreamFetchByKeys(
    Auction,
    () => [...invoiceTokens],
    [invoiceTokens]
  ).contracts;

  const createInvoice = async (
    payer,
    invoiceNumber,
    amount,
    issueDate,
    dueDate
  ) => {
    try {
      await ledger.exerciseByKey(
        Seller.Seller_AddInvoice,
        wrapDamlTuple([operator, currentParty]),
        {
          payer,
          invoiceNumber,
          amount,
          issueDate,
          dueDate,
        }
      );
    } catch (e) {
      console.log("Error while adding invoice.");
    }
  };

  const sendToBroker = async (invoiceCid: ContractId<Invoice>) => {
    if (brokerCustomerSellerContracts.length > 0) {
      const invoice = invoiceContracts.find((c) => c.contractId === invoiceCid)
        .payload;
      const bcSeller = brokerCustomerSellerContracts[0];
      if (invoice) {
        try {
          await ledger.exerciseByKey(
            BrokerCustomerSeller.BrokerCustomerSeller_SendInvoiceToBroker,
            wrapDamlTuple([bcSeller.payload.broker, operator, currentParty]),
            { invoice: invoice }
          );
        } catch (e) {
          console.log("Error while sending invoice to broker.");
          console.log("Broker Customer Sell", bcSeller);
          console.log("Invoice Cid", invoiceCid);
          console.error(e);
        }
      }
    }
  };
  const sendToAuction = async (
    contractId: ContractId<Invoice>,
    minimumQuantity,
    minimumProceeds,
    bidIncrement,
    endDate
  ) => {
    try {
      await ledger.exercise(Invoice.Invoice_SendToAuction, contractId, {
        minimumQuantity,
        minimumProceeds,
        bidIncrement,
        endDate: new Date(endDate).toISOString(),
      });
    } catch (e) {
      console.log("Error while sending invoice to auction.");
      console.error(e);
    }
  };
  //#endregion

  const invoices = useMemo(() => {
    const currentFilterFunction = (invoice) =>
      currentFilters.includes(mapInvoiceStatusEnum(invoice.status));
    const currentMapFunction = (invoiceContract: {
      payload: Invoice;
      contractId: ContractId<Invoice>;
    }) => {
      const auctionContract = auctionContracts.find(
        (auction) => auction?.key.label === invoiceContract.payload.token.label
      );

      return {
        ...invoiceContract.payload,
        auction: auctionContract?.payload,
        auctionCid: auctionContract?.contractId,
        invoiceCid: invoiceContract.contractId,
      };
    };

    if (currentSortFunction === undefined) {
      return invoiceContracts
        .map(currentMapFunction)
        .filter(currentFilterFunction);
    } else {
      return invoiceContracts
        .map(currentMapFunction)
        .filter(currentFilterFunction)
        .sort(currentSortFunction);
    }
  }, [currentSortFunction, currentFilters, invoiceContracts, auctionContracts]);

  const payers = useMemo(() => {
    return new Set(invoices.map((i) => i.payer));
  }, [invoices]);

  const onSendToAuction = async (invoiceCid) => {
    const invoice = invoices.find(
      (inv) => inv.invoiceCid === (invoiceCid as ContractId<Invoice>)
    ) as Invoice;

    setSendToAuctionFormState({
      ...sendToAuctionFormState,
      minimumQuantity: invoice.amount,
      contractId: invoiceCid,
      invoice: invoice,
    });

    openAuctionModal();
  };

  const onSendToBroker = async (invoiceCid) => {
    await sendToBroker(invoiceCid);
  };

  const sendToAuctionSubmit = async () => {
    const minimumProceeds = (
      +sendToAuctionFormState.bidIncrement * +sendToAuctionFormMinimumPrice
    ).toFixed(2);
    await sendToAuction(
      sendToAuctionFormState.contractId,
      sendToAuctionFormState.minimumQuantity,
      minimumProceeds,
      sendToAuctionFormState.bidIncrement,
      sendToAuctionFormState.endDate
    );
    setSendToAuctionFormState(sendToAuctionFormInitialState);
    setSendToAuctionFormMinimumPrice("0");
    setAuctionModalOpen(false);
  };

  const createInvoiceSubmit = async () => {
    await createInvoice(
      newInvoiceFormState.payerName,
      newInvoiceFormState.invoiceNumber,
      newInvoiceFormState.invoiceAmount,
      newInvoiceFormState.issueDate,
      newInvoiceFormState.dueDate
    );

    setInvoiceModalOpen(false);
  };

  const openFilterMenu = (event) => {
    switch (event.type) {
      case "blur": {
        //setSortMenuOpen(false);
        break;
      }
      case "click": {
        setFilterMenuOpen(!filterMenuOpen);
        break;
      }
    }
  };

  const filterMenuStatus = () =>
    filterMenuOpen ? "filter-menu-open" : "filter-menu-closed";
  const sortMenuStatus = () =>
    sortMenuOpen ? "sort-menu-open" : "sort-menu-closed";
  const openSortMenu = (event) => {
    switch (event.type) {
      case "blur": {
        //setSortMenuOpen(false);
        break;
      }
      case "click": {
        setSortMenuOpen(!sortMenuOpen);
        break;
      }
    }
  };

  const openInvoiceModal = () => {
    setInvoiceModalOpen(true);
  };
  const openAuctionModal = () => {
    setAuctionModalOpen(true);
  };

  const handleSortMenuFormChange = (e: ChangeEvent) => {
    const value = (e.target as HTMLInputElement).value;
    setCurrentSortOption(value);
    switch (value) {
      case "invoiceAmount-highToLow": {
        setCurrentSortFunction(() => (a: Invoice, b: Invoice) =>
          Number(b?.amount) - Number(a?.amount)
        );
        break;
      }
      case "invoiceAmount-lowToHigh": {
        setCurrentSortFunction(() => (a: Invoice, b: Invoice) =>
          Number(a?.amount) - Number(b?.amount)
        );
        break;
      }
      case "dueDate-newest": {
        setCurrentSortFunction(() => (a: Invoice, b: Invoice) =>
          +new Date(a?.dueDate) - +new Date(b?.dueDate)
        );
        break;
      }
      case "dueDate-oldest": {
        setCurrentSortFunction(() => (a: Invoice, b: Invoice) =>
          +new Date(b?.dueDate) - +new Date(a?.dueDate)
        );
        break;
      }
      case "payerName-alphabetical": {
        setCurrentSortFunction(() => (a: Invoice, b: Invoice) =>
          a?.payer.localeCompare(b?.payer)
        );
        break;
      }
      case "payerName-reverse": {
        setCurrentSortFunction(() => (a: Invoice, b: Invoice) =>
          b?.payer.localeCompare(a?.payer)
        );
        break;
      }
    }
    setSortMenuOpen(false);
  };
  const handleFilterMenuChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const value = target.value as InvoiceStatusEnum;
    if (target.checked) {
      if (!currentFilters.includes(value)) {
        setCurrentFilters([...currentFilters, value]);
      }
    } else {
      if (currentFilters.includes(value)) {
        setCurrentFilters(currentFilters.filter((status) => status !== value));
      }
    }
  };
  const handleNewInvoiceFormChange = (e: ChangeEvent) => {
    setNewInvoiceFormState({
      ...newInvoiceFormState,
      [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement)
        .value,
    });
  };
  const handleSendToAuctionFormDiscountChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    setSendToAuctionFormMinimumPrice((1.0 - +target.value * 0.01).toFixed(2));
  };
  const handleSendToAuctionFormMinimumQuantityChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    console.log("proceeds");
    setSendToAuctionFormMinimumPrice(
      (+target.value / +sendToAuctionFormState.bidIncrement).toFixed(2)
    );
  };

  const handleSendToAuctionFormChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    setSendToAuctionFormState({
      ...sendToAuctionFormState,
      [name]: target.value,
    });
  };

  //#region

  const invoicesList = invoices.map((invoice) => {
    const invoiceStatus = mapInvoiceStatusEnum(invoice.status);
    const bestBid = getCurrentBestBid(invoice.auction);
    let quantityFilled = 0;
    let totalProceeds = 0;
    if (invoice.auction && invoice.auction.status === "AuctionOpen") {
      quantityFilled = invoice.auction?.bids
        .map((x) => +x.amount)
        .reduce((a, b) => a + b, 0);
    } else if (invoice.auction) {
      quantityFilled = invoice.auction?.bids
        .map((x) => +x.quantityFilled)
        .reduce((a, b) => a + b, 0);
      totalProceeds = invoice.auction?.bids
        .map((x) => +x.quantityFilled * +x.price)
        .reduce((a, b) => a + b, 0);
    }
    const soldProps =
      invoiceStatus === InvoiceStatusEnum.Sold
        ? {
            auctionSoldDate: (invoice.status.value as InvoiceStatus.InvoiceSold)
              .soldAt,
          }
        : {};
    const paidProps =
      invoiceStatus === InvoiceStatusEnum.Paid
        ? {
            auctionPaidDate: (invoice.status.value as InvoiceStatus.InvoicePaid)
              .paidAt,
          }
        : {};

    return (
      <InvoiceCard
        key={invoice.payer + invoice.invoiceNumber}
        payerName={invoice.payer}
        invoiceNumber={invoice.invoiceNumber}
        invoiceAmount={invoice.amount}
        issuedDate={invoice.issueDate}
        paymentDueDate={invoice.dueDate}
        minProceedings={`${
          +invoice.amount * (getAuctionMinPrice(invoice.auction) ?? 1)
        }`}
        bestBidAmount={bestBid?.amount ?? "0"}
        bestDiscountRate={decimalToPercentString(bestBid?.price ?? 1)}
        quantityFilled={`${quantityFilled}`}
        totalProceeds={`${totalProceeds}`}
        numberOfBids={`${invoice.auction?.bids.length ?? "0"}`}
        invoiceStatus={invoiceStatus}
        auctionEndDate={invoice.auction?.endDate}
        invoiceCid={invoice.invoiceCid}
        auctionCid={invoice.auctionCid}
        showSendToBroker={
          props.role !== FactoringRole.Broker && invoice.seller === currentParty
        }
        showSellerActions={
          invoice.seller === currentParty ||
          invoiceStatus === InvoiceStatusEnum.Live
        }
        onSendToAuction={onSendToAuction}
        onSendToBroker={onSendToBroker}
        {...soldProps}
        {...paidProps}
      />
    );
  });

  const filterMenuArea = (
    <div className="filter-menu-area">
      <button className="filter-menu-button" onClick={openFilterMenu}>
        <img alt="" src={FilterList}></img>
      </button>
      <div className={`filter-menu ${filterMenuStatus()}`}>
        <div className="filter-menu-option">
          <input
            type="checkbox"
            value="Open"
            name="Open"
            id="filter-Open"
            onChange={handleFilterMenuChange}
            checked={currentFilters.includes(InvoiceStatusEnum.Open)}
          />
          <label htmlFor="filter-Open">Open</label>
        </div>
        <div className="filter-menu-option">
          <input
            type="checkbox"
            value="Live"
            name="Live"
            id="filter-Live"
            onChange={handleFilterMenuChange}
            checked={currentFilters.includes(InvoiceStatusEnum.Live)}
          />
          <label htmlFor="filter-Live">Live</label>
        </div>
        <div className="filter-menu-option">
          <input
            type="checkbox"
            value="Sold"
            name="Sold"
            id="filter-Sold"
            onChange={handleFilterMenuChange}
            checked={currentFilters.includes(InvoiceStatusEnum.Sold)}
          />
          <label htmlFor="Sold">Sold</label>
        </div>
        <div className="filter-menu-option">
          <input
            type="checkbox"
            value="Paid"
            name="Paid"
            id="filter-Paid"
            onChange={handleFilterMenuChange}
            checked={currentFilters.includes(InvoiceStatusEnum.Paid)}
          />
          <label htmlFor="filter-Paid">Paid</label>
        </div>
      </div>
    </div>
  );

  const sortMenuArea = (
    <div className="sort-menu-area">
      <button
        className={`sort-menu-button ${sortMenuStatus()}`}
        onClick={openSortMenu}
        onBlur={openSortMenu}
      >
        <div className="sort-menu-button-label">Sort By</div>
        <img
          className="sort-menu-button-arrow"
          alt=""
          src={ArrowDropDown}
        ></img>
      </button>
      <div className={`sort-menu ${sortMenuStatus()}`}>
        <div className="sort-menu-section">
          <div className="sort-menu-section-label">Invoice Amount</div>
          <div>
            <input
              type="radio"
              value="invoiceAmount-highToLow"
              id="invoiceAmount-highToLow"
              checked={currentSortOption === "invoiceAmount-highToLow"}
              onChange={handleSortMenuFormChange}
              name="invoiceSort"
            />
            <label htmlFor="invoiceAmount-highToLow">High to Low</label>
          </div>
          <div>
            <input
              type="radio"
              value="invoiceAmount-lowToHigh"
              checked={currentSortOption === "invoiceAmount-lowToHigh"}
              onChange={handleSortMenuFormChange}
              id="invoiceAmount-lowToHigh"
              name="invoiceSort"
            />
            <label htmlFor="invoiceAmount-lowToHigh">Low to High</label>
          </div>
        </div>
        <div className="sort-menu-section">
          <div className="sort-menu-section-label">Payment Due Date</div>
          <div>
            <input
              type="radio"
              value="dueDate-newest"
              checked={currentSortOption === "dueDate-newest"}
              onChange={handleSortMenuFormChange}
              id="dueDate-newest"
              name="invoiceSort"
            />
            <label htmlFor="dueDate-newest">Newest</label>
          </div>
          <div>
            <input
              type="radio"
              value="dueDate-oldest"
              checked={currentSortOption === "dueDate-oldest"}
              onChange={handleSortMenuFormChange}
              id="dueDate-oldest"
              name="invoiceSort"
            />
            <label htmlFor="dueDate-oldest">Oldest</label>
          </div>
        </div>
        <div className="sort-menu-section">
          <div className="sort-menu-section-label">Payor Name</div>
          <div>
            <input
              type="radio"
              value="payerName-alphabetical"
              checked={currentSortOption === "payerName-alphabetical"}
              onChange={handleSortMenuFormChange}
              id="payerName-alphabetical"
              name="invoiceSort"
            />
            <label htmlFor="payerName-alphabetical">A-Z</label>
          </div>
          <div>
            <input
              type="radio"
              value="payerName-reverse"
              id="payerName-reverse"
              checked={currentSortOption === "payerName-reverse"}
              onChange={handleSortMenuFormChange}
              name="invoiceSort"
            />
            <label htmlFor="payerName-reverse">Z-A</label>
          </div>
        </div>
        <button className="sort-menu-apply-button">Apply</button>
      </div>
    </div>
  );

  const newInvoiceButton = (
    <SolidButton
      label="Add New Invoice"
      icon={Add}
      onClick={openInvoiceModal}
      className="new-invoice-button"
    />
  );

  const invoiceModal = (
    <form
      onSubmit={(e) => {
        createInvoiceSubmit();
        e.preventDefault();
      }}
    >
      <div className="invoice-modal">
        <div className="modal-header">Add New Invoice</div>
        <button
          onClick={() => {
            setInvoiceModalOpen(false);
            setSendToAuctionFormState(sendToAuctionFormInitialState);
            setSendToAuctionFormMinimumPrice("0");
          }}
          className="modal-close-button"
        >
          X
        </button>
        <InputField
          required
          name="payerName"
          label="Payor Name"
          type="text"
          onChange={handleNewInvoiceFormChange}
          placeholder="e.g. Jonathan Malka"
        />
        <InputField
          required
          name="invoiceAmount"
          label="Invoice Amount ($)"
          type="number"
          onChange={handleNewInvoiceFormChange}
          placeholder="e.g. 100000"
        />
        <InputField
          required
          name="invoiceNumber"
          label="Invoice Number"
          type="text"
          onChange={handleNewInvoiceFormChange}
          placeholder="e.g. ab123"
        />

        <div className="invoice-modal-date-section">
          <InputField
            required
            name="issueDate"
            label="Issue Date"
            type="date"
            onChange={handleNewInvoiceFormChange}
          />
          <InputField
            required
            name="dueDate"
            label="Due Date"
            type="date"
            min={newInvoiceFormState.issueDate ?? ""}
            onChange={handleNewInvoiceFormChange}
          />
        </div>

        <button type="submit" className="invoice-modal-create-button">
          Create
        </button>
      </div>
    </form>
  );

  const auctionModal = (
    <form
      onSubmit={(e) => {
        sendToAuctionSubmit();
        e.preventDefault();
      }}
    >
      <div className="auction-modal">
        <div className="modal-header">Send Auction</div>
        <button
          onClick={() => setAuctionModalOpen(false)}
          className="modal-close-button"
        >
          X
        </button>

        <InputField
          required
          name="minimumQuantity"
          label="Minimum Auction Amount ($)"
          type="text"
          onChange={handleSendToAuctionFormChange}
          placeholder={`e.g. ${formatAsCurrency(
            sendToAuctionFormState.invoice?.amount ?? "100000"
          )}`}
          min="0"
          max={`${sendToAuctionFormState.invoice?.amount ?? "100000"}`}
        />
        <InputField
          required
          name="bidIncrement"
          label="Bid Increment ($)"
          type="number"
          onChange={handleSendToAuctionFormChange}
          placeholder="e.g. 500"
          min="0"
        />
        <div className="auction-modal-discount-section">
          <InputField
            required
            name="discount"
            label="Maximum Discount Rate (%)"
            type="number"
            min="0"
            max="100"
            onChange={handleSendToAuctionFormDiscountChange}
            value={`${((1.0 - +sendToAuctionFormMinimumPrice) * 100).toFixed(
              2
            )}`}
            placeholder="e.g. 5"
            debounceTimeout={500}
          />
          <div className="or">
            <div>or</div>
          </div>
          <InputField
            required
            name="minimumProceeds"
            label="Minimum Proceeds ($)"
            type="number"
            placeholder="e.g. 10000"
            onChange={handleSendToAuctionFormMinimumQuantityChange}
            value={(
              +(sendToAuctionFormState.bidIncrement ?? "0") *
              +sendToAuctionFormMinimumPrice
            ).toFixed(2)}
            min="0"
            debounceTimeout={500}
          />
        </div>

        <div className="base-input-field">
          <label htmlFor="endDate">End Date</label>
          <input
            required
            onChange={handleSendToAuctionFormChange}
            min={new Date().toISOString().slice(0, 10)}
            type="date"
            id="endDate"
            name="endDate"
          ></input>
        </div>

        <SolidButton
          type="submit"
          label="Send To Auction"
          className="send-to-auction-modal-submit-button"
        ></SolidButton>
      </div>
    </form>
  );

  //#endregion

  return (
    <BasePage {...props}>
      {props.role === FactoringRole.Broker && (
        <div className="invoices-select-container">
          <TransparentSelect label="Payor" className="buyers-select">
            {[...payers].map((p) => (
              <option value={p}>{p}</option>
            ))}
          </TransparentSelect>
          <TransparentSelect label="Seller" className="buyers-select">
            <option value="Test">Roberto</option>
          </TransparentSelect>
        </div>
      )}
      <div className="page-subheader">
        <div className="page-subheader-text">Invoices</div>
        {newInvoiceButton}
        <div className="filter-sort-action-bar">
          {filterMenuArea}
          {sortMenuArea}
        </div>
      </div>
      <div className="invoices-statistics">{`${
        invoices.length
      } | ${formatAsCurrency(
        invoices.reduce((a, b) => a + +b.amount, 0)
      )}`}</div>
      <div className="invoices-list">{invoicesList}</div>
      {invoiceModalOpen &&
        createPortal(
          <div className="modal">{invoiceModal}</div>,
          document.body
        )}
      {auctionModalOpen &&
        createPortal(
          <div className="modal">{auctionModal}</div>,
          document.body
        )}
    </BasePage>
  );
};

export default InvoicesView;
