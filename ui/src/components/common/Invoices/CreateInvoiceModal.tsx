import { Seller } from "@daml.js/daml-factoring/lib/Factoring/Seller";
import ledger from "@daml/ledger";
import { useLedger } from "@daml/react";
import React from "react";
import { InputField } from "../InputField/InputField";
/*
const CreateInvoiceModal = (props) => {
  const ledger = useLedger();
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
  const handleChange = () => {};
  return (
    <div className="invoice-modal">
      <div className="modal-header">Add New Invoice</div>
      <button
        onClick={() => setInvoiceModalOpen(false)}
        className="modal-close-button"
      >
        X
      </button>
      <InputField
        name="payerName"
        label="Payer Name"
        type="text"
        onChange={handleChange}
        placeholder="e.g. Jonathan Malka"
      />
      <InputField
        name="invoiceAmount"
        label="Invoice Amount"
        type="text"
        onChange={handleChange}
        placeholder="e.g. 100000"
      />
      <InputField
        name="invoiceNumber"
        label="Invoice Number"
        type="text"
        onChange={handleChange}
        placeholder="e.g. ab123"
      />

      <div className="invoice-modal-date-section">
        <InputField
          name="issueDate"
          label="Issue Date"
          type="date"
          onChange={handleChange}
          required
        />
        <InputField
          name="dueDate"
          label="Due Date"
          type="date"
          onChange={handleChange}
          required
        />
      </div>

      <button
        onClick={createInvoiceSubmit}
        className="invoice-modal-create-button"
      >
        Create
      </button>
    </div>
  );
};
*/
export default {};
