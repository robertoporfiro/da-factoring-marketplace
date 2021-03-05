import React, { ChangeEvent, useState } from "react";
import { useParty } from "@daml/react";
import { FactoringRole } from "../../FactoringRole";
import { InputField } from "../../InputField/InputField";
import { useRegistryLookup } from "../../RegistryLookup";
import { SelectField } from "../../SelectField/SelectField";
import { SolidButton } from "../../SolidButton/SolidButton";

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
    onBehalfOf: currentParty,
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
        <div className="dual-input-field">
          {props.userRole === FactoringRole.Broker && (
            <>
              <SelectField
                name="onBehalfOf"
                onChange={handleChange}
                label="On behalf of"
                required
              >
                <option value={currentParty}>Self</option>
                {props.sellers.map((s) => (
                  <option value={s}>{`${
                    registry.sellerMap.get(s).firstName
                  }`}</option>
                ))}
              </SelectField>
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
        <div className="dual-input-field">
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
        <SolidButton
          type="submit"
          className="invoice-modal-create-button"
          label="Create Invoice"
        />
      </div>
    </form>
  );
};
