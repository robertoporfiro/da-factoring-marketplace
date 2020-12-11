import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import BasePage from "../../BasePage/BasePage";

import "./Invoices.css";
import Add from "../../../assets/Add.svg";
import ArrowDropDown from "../../../assets/ArrowDropDown.svg";
import FilterList from "../../../assets/FilterList.svg";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import {
  Invoice,
  InvoiceStatus,
  Seller,
} from "@daml.js/da-marketplace/lib/Marketplace/Factoring";
import { useOperator } from "../../common/common";
import { Token } from "@daml.js/da-marketplace/lib/Marketplace/Token";
import InvoiceCard, { InvoiceStatusEnum } from "./InvoiceCard";
import { wrapDamlTuple } from "../../common/damlTypes";
import { random } from "lodash";
import { createPortal } from "react-dom";
import { ContractId } from "@daml/types";

let SellerInvoices: React.FC = () => {
  let [newInvoiceFormState, setNewInvoiceFormState] = useState({
    dueDate: "",
    issueDate: "",
    invoiceAmount: "",
    payerName: "",
    invoiceNumber: "",
  });
  let [sendToAuctionFormState, setSendToAuctionFormState] = useState({
    minimumQuantity: "",
    minimumProceeds: "",
    bidIncrement: "",
    endDate: "",
    contractId: undefined,
  });
  let [currentSortOption, setCurrentSortOption] = useState<any>();
  let [currentSortFunction, setCurrentSortFunction] = useState<any>();
  let [currentFilters, setCurrentFilters] = useState([
    InvoiceStatusEnum.Live,
    InvoiceStatusEnum.Open,
    InvoiceStatusEnum.Paid,
    InvoiceStatusEnum.Sold,
  ]);
  let [filterMenuOpen, setFilterMenuOpen] = useState(false);
  let [sortMenuOpen, setSortMenuOpen] = useState(false);
  let [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  let [auctionModalOpen, setAuctionModalOpen] = useState(false);

  const ledger = useLedger();
  const operator = useOperator();
  const seller = useParty();
  const mapInvoiceStatusEnum = (damlStatus: InvoiceStatus) => {
    switch (damlStatus.tag) {
      case "InvoiceLive":
        return InvoiceStatusEnum.Live;
      case "InvoiceOpen":
        return InvoiceStatusEnum.Open;
      case "InvoicePaid":
        return InvoiceStatusEnum.Paid;
      case "InvoiceSold":
        return InvoiceStatusEnum.Sold;
    }
  };

  //#region  DAML stuff
  const invoiceContracts = useStreamQueries(
    Invoice,
    () => [],
    [],
    (e) => {
      console.log("Unexpected close from Invoice: ", e);
    }
  ).contracts;

  const sellerContract = useStreamQueries(
    Seller,
    () => [],
    [],
    (e) => {
      console.log("Unexpected close from Invoice: ", e);
    }
  ).contracts[0];

  const createInvoice = async (
    payer,
    invoiceNumber,
    amount,
    issueDate,
    dueDate
  ) => {
    try {
      await ledger.exercise(
        Seller.Seller_AddInvoice,
        sellerContract.contractId,
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
        endDate,
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
      return {
        ...invoiceContract.payload,
        contractId: invoiceContract.contractId,
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
  }, [invoiceContracts, currentSortFunction, currentFilters]);

  const onSendToAuction = async (contractId) => {
    openAuctionModal();
    setSendToAuctionFormState({
      ...sendToAuctionFormState,
      contractId: contractId,
    });
  };

  const sendToAuctionSubmit = async () => {
    await sendToAuction(
      sendToAuctionFormState.contractId,
      sendToAuctionFormState.minimumQuantity,
      sendToAuctionFormState.minimumProceeds,
      sendToAuctionFormState.bidIncrement,
      sendToAuctionFormState.endDate
    );
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
  /*
  for (let i = 0; i < 10; i++) {
    let invoiceNumber = `TD${random(10, 90)}`;
    if (i % 2 == 0) {
      invoicesList.push(
        <InvoiceCard
          key={invoiceNumber}
          payerName={`Company ${random(1, 10)}`}
          invoiceNumber={`TD${random(10, 90)}`}
          invoiceAmount={`100${random(11, 20)}.00`}
          issuedDate={"2020-12-04"}
          paymentDueDate={"2020-12-31"}
          discountRate={"4.00%"}
          invoiceStatus={InvoiceStatusEnum.Open}
        />
      );
    } else {
      invoicesList.push(
        <InvoiceCard
          key={invoiceNumber}
          payerName={`Company ${random(1, 10)}`}
          invoiceNumber={`TD${random(10, 90)}`}
          invoiceAmount={`100${random(11, 20)}.00`}
          issuedDate={"2020-12-04"}
          paymentDueDate={"2020-12-31"}
          discountRate={"4.00%"}
          invoiceStatus={InvoiceStatusEnum.Open}
          latestBid={`100${random(11, 40)}.00`}
          latestDiscountRate={"4.00%"}
        />
      );
    }
  }
*/
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
        setCurrentFilters(currentFilters.filter((status) => status != value));
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
  const handleSendToAuctionFormChange = (e: ChangeEvent) => {
    setSendToAuctionFormState({
      ...sendToAuctionFormState,
      [(e.target as HTMLInputElement).name]: (e.target as HTMLInputElement)
        .value,
    });
  };

  //#region

  const invoicesList = invoices.map((invoice) => (
    <InvoiceCard
      key={invoice.invoiceNumber}
      payerName={invoice.payer}
      invoiceNumber={invoice.invoiceNumber}
      invoiceAmount={invoice.amount}
      issuedDate={invoice.issueDate}
      paymentDueDate={invoice.dueDate}
      discountRate={"4.00%"}
      invoiceStatus={mapInvoiceStatusEnum(invoice.status)}
      contractId={invoice.contractId}
      onSendToAuction={onSendToAuction}
    />
  ));

  const filterMenuArea = (
    <div className="filter-menu-area">
      <button className="filter-menu-button" onClick={openFilterMenu}>
        <img src={FilterList}></img>
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
        <img className="sort-menu-button-arrow" src={ArrowDropDown}></img>
      </button>
      <div className={`sort-menu ${sortMenuStatus()}`}>
        <div className="sort-menu-section">
          <div className="sort-menu-section-label">Invoice Amount</div>
          <div>
            <input
              type="radio"
              value="invoiceAmount-highToLow"
              id="invoiceAmount-highToLow"
              checked={currentSortOption == "invoiceAmount-highToLow"}
              onChange={handleSortMenuFormChange}
              name="invoiceSort"
            />
            <label htmlFor="invoiceAmount-highToLow">High to Low</label>
          </div>
          <div>
            <input
              type="radio"
              value="invoiceAmount-lowToHigh"
              checked={currentSortOption == "invoiceAmount-lowToHigh"}
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
              checked={currentSortOption == "dueDate-newest"}
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
              checked={currentSortOption == "dueDate-oldest"}
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
              checked={currentSortOption == "payerName-alphabetical"}
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
              checked={currentSortOption == "payerName-reverse"}
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
    <button onClick={openInvoiceModal} className="new-invoice-button">
      <img src={Add}></img>{" "}
      <div className="new-invoice-button-label">Add New Invoice</div>
    </button>
  );

  const invoiceModal = (
    <div className="invoice-modal">
      <div className="modal-header">Add New Invoice</div>
      <button
        onClick={() => setInvoiceModalOpen(false)}
        className="modal-close-button"
      >
        X
      </button>
      <div className="base-input-field">
        <label htmlFor="payerName">Payer Name</label>
        <input
          onChange={handleNewInvoiceFormChange}
          type="text"
          id="payerName"
          name="payerName"
          placeholder="e.g. Jonathan Malka"
        />
      </div>
      <div className="base-input-field">
        <label htmlFor="invoiceAmount">Invoice Amount</label>
        <input
          onChange={handleNewInvoiceFormChange}
          type="text"
          id="invoiceAmount"
          name="invoiceAmount"
          placeholder="e.g. 100000"
        />
      </div>
      <div className="base-input-field">
        <label htmlFor="invoiceNumber">Invoice Number</label>
        <input
          onChange={handleNewInvoiceFormChange}
          type="text"
          id="invoiceNumber"
          name="invoiceNumber"
          placeholder="e.g. ab123"
        />
      </div>
      <div className="invoice-modal-date-section">
        <div className="base-input-field">
          <label htmlFor="issueDate">Issue Date</label>
          <input
            onChange={handleNewInvoiceFormChange}
            type="date"
            id="issueDate"
            name="issueDate"
          ></input>
        </div>
        <div className="base-input-field">
          <label htmlFor="dueDate">Due Date</label>
          <input
            onChange={handleNewInvoiceFormChange}
            type="date"
            id="dueDate"
            name="dueDate"
            placeholder="01/01/2020"
          ></input>
        </div>
      </div>
      {
        <button
          onClick={createInvoiceSubmit}
          className="invoice-modal-create-button"
        >
          Create
        </button>
      }
    </div>
  );

  const auctionModal = (
    <div className="auction-modal">
      <div className="modal-header">Send Auction</div>
      <button
        onClick={() => setAuctionModalOpen(false)}
        className="modal-close-button"
      >
        X
      </button>
      <div className="base-input-field">
        <label htmlFor="minimumQuantity">Minimum Auction Quantity</label>
        <input
          onChange={handleSendToAuctionFormChange}
          type="text"
          id="minimumQuantity"
          name="minimumQuantity"
          placeholder="e.g. 100,000"
        />
      </div>
      <div className="base-input-field">
        <label htmlFor="minimumProceeds">Minimum Auction Proceeds</label>
        <input
          onChange={handleSendToAuctionFormChange}
          type="text"
          id="minimumProceeds"
          name="minimumProceeds"
          placeholder="e.g. 10000"
        />
      </div>
      <div className="base-input-field">
        <label htmlFor="bidIncrement">Bid Increment</label>
        <input
          onChange={handleSendToAuctionFormChange}
          type="text"
          id="bidIncrement"
          name="bidIncrement"
          placeholder="e.g. 500"
        />
      </div>
      <div className="base-input-field">
        <label htmlFor="endDate">End Date</label>
        <input
          onChange={handleSendToAuctionFormChange}
          type="date"
          id="endDate"
          name="endDate"
        ></input>
      </div>
      {
        <button
          onClick={sendToAuctionSubmit}
          className="invoice-modal-create-button"
        >
          Create
        </button>
      }
    </div>
  );

  //#endregion

  return (
    <BasePage activeRoute="">
      <div className="page-subheader">
        <div className="page-subheader-text">Invoices</div>
        {newInvoiceButton}
        <div className="filter-sort-action-bar">
          {filterMenuArea}
          {sortMenuArea}
        </div>
      </div>
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

export default SellerInvoices;
