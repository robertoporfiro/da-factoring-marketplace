import { Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React, { ChangeEvent, useMemo, useState } from "react";
import { FactoringRole } from "../../FactoringRole";
import { InputField } from "../../InputField/InputField";
import { useRegistryLookup } from "../../RegistryLookup";
import { SolidButton } from "../../SolidButton/SolidButton";
import { formatAsCurrency } from "../../utils";
import "./NewInvoiceModal.css";

interface NewInvoiceModalProps {
  userRole?: FactoringRole;
  onModalClose: () => void;
  onInvoiceCreate: (state: NewInvoiceModalState) => void;
}

interface NewInvoiceModalState {
  dueDate: string;
  issueDate: string;
  invoiceAmount: string;
  payerName: string;
  invoiceNumber: string;
  onBehalfOf?: string;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = (props) => {
  const [state, setState] = useState<NewInvoiceModalState>({
    dueDate: "",
    issueDate: "",
    invoiceAmount: "",
    payerName: "",
    invoiceNumber: "",
    onBehalfOf: "Broker",
  });

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setState({
      ...state,
      [name]: value,
    });
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await props.onInvoiceCreate(state);
      }}
    >
      <div className="invoice-modal">
        <div className="modal-header">Add New Invoice</div>
        <button
          onClick={() => {
            props.onModalClose();
          }}
          className="modal-close-button"
        >
          X
        </button>
        {props.userRole === FactoringRole.Broker && (
          <select
            className="input-field"
            name="onBehalfOf"
            required
            onChange={handleChange}
          >
            <option value="Broker">Broker</option>
            <option value="Seller1">Seller1</option>
          </select>
        )}
        <InputField
          required
          name="payerName"
          label="Payor Name"
          type="text"
          onChange={handleChange}
          placeholder="e.g. Jonathan Malka"
        />
        <InputField
          required
          name="invoiceAmount"
          label="Invoice Amount ($)"
          type="number"
          onChange={handleChange}
          placeholder="e.g. 100000"
        />
        <InputField
          required
          name="invoiceNumber"
          label="Invoice Number"
          type="text"
          onChange={handleChange}
          placeholder="e.g. ab123"
        />

        <div className="invoice-modal-date-section">
          <InputField
            required
            name="issueDate"
            label="Issue Date"
            type="date"
            onChange={handleChange}
          />
          <InputField
            required
            name="dueDate"
            label="Due Date"
            type="date"
            min={state.issueDate ?? ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="invoice-modal-create-button">
          Create
        </button>
      </div>
    </form>
  );
};
