import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import { SendToAuctionModal } from "../../common/Invoices/SendToAuctionModal";
import { SolidButton } from "../../common/SolidButton/SolidButton";
import BrokerRoutes from "../BrokerRoutes";
import Add from "../../../assets/Add.svg";
import "./Invoices.css";
import { OutlineButton } from "../../common/OutlineButton/OutlineButton";
import { useStreamQueries } from "@daml/react";
import { Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { useRegistryLookup } from "../../common/RegistryLookup";
import { formatAsCurrency } from "../../common/utils";

const BrokerInvoices: React.FC<IBasePageProps> = (props) => {
  const registry = useRegistryLookup();
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const invoiceContracts = useStreamQueries(Invoice).contracts;
  const invoices = useMemo(() => {
    return invoiceContracts.map((c) => c.payload);
  }, [invoiceContracts]);

  const invoiceRows = invoices.map((invoice) => (
    <tr>
      <td>
        <input className="base-checkbox" type="checkbox"></input>
      </td>
      <td>{invoice.invoiceNumber}</td>
      <td>{invoice.payer}</td>
      <td>{registry.sellerMap.get(invoice.seller)?.firstName}</td>
      <td>{formatAsCurrency(invoice.amount)}</td>
      <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
      <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
      <td>
        <OutlineButton
          label="Send to Auction"
          onClick={() => {
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
        {auctionModalOpen && <></>}
      </div>
    </BasePage>
  );
};

export default BrokerInvoices;
