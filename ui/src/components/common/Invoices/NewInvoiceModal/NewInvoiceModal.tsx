import { Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import { useParty } from "@daml/react";
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
  sellers?: Array<string>;
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
  const registry = useRegistryLookup();
  const currentParty = useParty();
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
        <div className="invoice-modal-date-section">
          {props.userRole === FactoringRole.Broker && (
            <>
              <select
                className="input-field"
                aria-label="On Behalf Of"
                name="onBehalfOf"
                required
                onChange={handleChange}
              >
                <option value={currentParty}>Self Invoice</option>
                {props.sellers.map((s) => (
                  <option value={s}>{`On behalf of ${
                    registry.sellerMap.get(s).firstName
                  }`}</option>
                ))}
              </select>
            </>
          )}
          <InputField
            required
            name="payerName"
            label="Payor Name"
            type="text"
            onChange={handleChange}
            placeholder="e.g. Jonathan Malka"
          />
        </div>
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
          Create Invoice
        </button>
      </div>
    </form>
  );
};
