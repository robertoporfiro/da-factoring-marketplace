import React, { ChangeEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import { SendToAuctionModal } from "../../common/Invoices/SendToAuctionModal";
import { SolidButton } from "../../common/SolidButton/SolidButton";
import BrokerRoutes from "../BrokerRoutes";
import Add from "../../../assets/Add.svg";
import "./Invoices.css";
import { OutlineButton } from "../../common/OutlineButton/OutlineButton";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { useRegistryLookup } from "../../common/RegistryLookup";
import { formatAsCurrency } from "../../common/utils";
import { wrapDamlTuple } from "../../common/damlTypes";
import { useOperator } from "../../common/common";
import { Broker } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { sendPoolToAuction, sendToAuction } from "../../common/factoringUtils";

const BrokerInvoices: React.FC<IBasePageProps> = (props) => {
  const ledger = useLedger();
  const registry = useRegistryLookup();
  const currentParty = useParty();
  const operator = useOperator();
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [checkedInvoices, setCheckedInvoices] = useState<Array<Invoice>>([]);
  const invoiceContracts = useStreamQueries(Invoice).contracts;
  const invoices = useMemo(() => {
    return invoiceContracts
      .map((c) => c.payload)
      .filter(
        (i) =>
          i.seller === currentParty &&
          i.included?.length === 0 &&
          i.status.tag === "InvoiceOpen"
      );
  }, [currentParty, invoiceContracts]);

  const handleInvoicesSelectChange = (e: ChangeEvent, invoice: Invoice) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    if (target.checked) {
      setCheckedInvoices([invoice, ...checkedInvoices]);
    } else {
      setCheckedInvoices([
        ...checkedInvoices.filter((i) => i.invoiceId !== invoice.invoiceId),
      ]);
    }
  };

  const invoiceRows = invoices.map((invoice) => (
    <tr>
      <td>
        <input
          className="base-checkbox"
          type="checkbox"
          onChange={(e) => {
            handleInvoicesSelectChange(e, invoice);
          }}
          checked={checkedInvoices.find((i) => i === invoice) ? true : false}
        ></input>
      </td>
      <td>{invoice.invoiceNumber}</td>
      <td>{invoice.payer}</td>
      <td>{registry.sellerMap.get(invoice.seller)?.firstName}</td>
      <td>{formatAsCurrency(invoice.amount)}</td>
      <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
      <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
      <td>
        <OutlineButton
          disabled={checkedInvoices.indexOf(invoice) !== -1}
          label="Send to Auction"
          onClick={() => {
            setCheckedInvoices([invoice]);
            setAuctionModalOpen(true);
          }}
        />
      </td>
    </tr>
  ));
  return (
    <BasePage routes={BrokerRoutes} activeRoute="Inventory" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Invoices </div>
        <SolidButton
          label="Pool for Auction"
          icon={Add}
          className="pool-auction-button"
          onClick={() => {
            setAuctionModalOpen(true);
          }}
          disabled={checkedInvoices.length < 2}
        />
      </div>
      <div className="broker-invoices-table-container table-container">
        <table className="base-table broker-invoices-table">
          <thead>
            <tr>
              <th scope="col">
                <input type="checkbox"></input>
              </th>
              <th scope="col">Invoice No.</th>
              <th scope="col">Payor</th>
              <th scope="col">Seller</th>
              <th scope="col">Amount</th>
              <th scope="col">Issued</th>
              <th scope="col">Payment Due</th>
              <th scope="col"> </th>
            </tr>
          </thead>
          <tbody>{invoiceRows}</tbody>
        </table>
        {auctionModalOpen &&
          createPortal(
            <div className="modal">
              <SendToAuctionModal
                onModalClose={() => {
                  setAuctionModalOpen(false);
                  if (checkedInvoices.length === 1) {
                    setCheckedInvoices([]);
                  }
                }}
                onSendToAuction={async (invoices, state) => {
                  const minimumProceeds =
                    +state.bidIncrement * +state.minimumPrice;
                  if (invoices.length > 1) {
                    await sendPoolToAuction(
                      ledger,
                      operator,
                      currentParty,
                      invoices,
                      state.minimumQuantity,
                      +state.bidIncrement * +state.minimumPrice,
                      state.bidIncrement,
                      state.endDate,
                      state.invoiceNumber
                    );
                  } else if (invoices.length === 1) {
                    await sendToAuction(
                      ledger,
                      invoices[0],
                      state.minimumQuantity,
                      minimumProceeds,
                      state.bidIncrement,
                      state.endDate
                    );
                  }
                  setAuctionModalOpen(false);
                  setCheckedInvoices([]);
                }}
                invoices={checkedInvoices}
              />
            </div>,
            document.body
          )}
      </div>
    </BasePage>
  );
};

export default BrokerInvoices;
