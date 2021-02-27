import { Invoice } from "@daml.js/daml-factoring/lib/Factoring/Invoice";
import React, { ChangeEvent, useMemo, useState } from "react";
import { InputField } from "../../InputField/InputField";
import { useRegistryLookup } from "../../RegistryLookup";
import { SolidButton } from "../../SolidButton/SolidButton";
import { formatAsCurrency } from "../../utils";
import "./SendToAuctionModal.css";

interface SendToAuctionModalProps {
  onModalClose: () => void;
  onSendToAuction: (
    invoices: Invoice[],
    state: SendToAuctionModalState
  ) => void;
  invoices: Invoice[];
}

interface SendToAuctionModalState {
  minimumPrice: string;
  minimumQuantity: string;
  bidIncrement: string;
  endDate: string;
  dueDate?: string;
  issueDate?: string;
  invoiceNumber?: string;
}

export const SendToAuctionModal: React.FC<SendToAuctionModalProps> = (
  props
) => {
  const registry = useRegistryLookup();
  const isPooledAuction = props.invoices.length > 1;
  const totalInvoiceAmount = useMemo(
    () => props.invoices.map((i) => +i.amount).reduce((a, b) => a + b, 0),
    [props.invoices]
  );
  const [state, setState] = useState<SendToAuctionModalState>({
    minimumPrice: "1",
    minimumQuantity: totalInvoiceAmount.toFixed(2),
    bidIncrement: "0",
    endDate: "",
    invoiceNumber: "",
    dueDate: "",
    issueDate: "",
  });

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    if (name === "discount") {
      setState({
        ...state,
        minimumPrice: (1.0 - +target.value * 0.01).toFixed(2),
      });
    } else if (name === "minimumProceeds") {
      setState({
        ...state,
        minimumPrice: (+target.value / +state.bidIncrement).toFixed(2),
      });
    } else {
      setState({
        ...state,
        [name]: value,
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        props.onSendToAuction(props.invoices, state);
        e.preventDefault();
      }}
    >
      <div className="send-to-auction-modal">
        <div className="modal-header">Send To Auction</div>
        <button
          onClick={() => props.onModalClose()}
          className="modal-close-button"
        >
          X
        </button>
        {props.invoices.length > 1 && (
          <>
            <table className="base-table send-to-auction-modal-pooled-auction-table">
              <thead>
                <tr>
                  <th scope="col">Invoice No.</th>
                  <th scope="col">Payor</th>
                  <th scope="col">Seller</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {props.invoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.payer}</td>
                    <td>
                      {registry.sellerMap.get(invoice.initialOwner)
                        ?.firstName ?? ""}
                    </td>
                    <td>{formatAsCurrency(invoice.amount)}</td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div className="auction-modal-invoice-total-amount">
          <div className="auction-modal-invoice-total-amount-label">
            Invoice Total Amount
          </div>
          <div className="auction-modal-invoice-total-amount-data">
            {formatAsCurrency(totalInvoiceAmount)}
          </div>
        </div>
        <div className="send-to-auction-modal-form-area">
          {isPooledAuction && (
            <>
              <InputField
                required
                name="invoiceNumber"
                label="Pooled Invoice No."
                type="text"
                onChange={handleChange}
                placeholder="e.g. W1001"
                debounceTimeout={1000}
              />
              <div className="invoice-modal-date-section">
                <InputField
                  name="issueDate"
                  label="Pooled Invoice Issue Date"
                  type="date"
                  onChange={handleChange}
                  required
                />
                <InputField
                  name="dueDate"
                  label="Pooled Invoice Due Date"
                  type="date"
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div className="invoice-modal-date-section">
            <InputField
              required
              name="minimumQuantity"
              label="Minimum Auction Amount ($)"
              type="number"
              onChange={handleChange}
              max={totalInvoiceAmount.toFixed(2)}
              value={state.minimumQuantity}
              placeholder="e.g. 100,000"
              min="0"
              debounceTimeout={1000}
            />
            <InputField
              required
              name="bidIncrement"
              label="Bid Increment ($)"
              type="number"
              onChange={handleChange}
              placeholder="e.g. 500"
              min="0"
            />
          </div>
          <div className="auction-modal-discount-section">
            <InputField
              required
              name="discount"
              label="Maximum Discount Rate (%)"
              type="number"
              min="0"
              max="100"
              onChange={handleChange}
              value={`${((1.0 - +state.minimumPrice) * 100).toFixed(2)}`}
              placeholder="e.g. 5"
              debounceTimeout={1000}
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
              onChange={handleChange}
              value={(+state.bidIncrement * +state.minimumPrice).toFixed(2)}
              min="0"
              debounceTimeout={1000}
            />
          </div>

          <div className="base-input-field">
            <label htmlFor="endDate">End Date</label>
            <input
              required
              onChange={handleChange}
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
          />
        </div>
      </div>
    </form>
  );
};
