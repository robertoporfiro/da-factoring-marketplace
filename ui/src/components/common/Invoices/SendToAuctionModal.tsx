import { Invoice } from "@daml.js/da-marketplace/lib/Factoring/Invoice";
import React, { ChangeEvent, useState } from "react";
import { InputField } from "../InputField/InputField";
import { SolidButton } from "../SolidButton/SolidButton";
import "./SendToAuctionModal.css";

interface SendToAuctionModalProps {
  onModalClose: () => void;
  onSendToAuction: () => void;
  invoices: Invoice[];
}

export const SendToAuctionModal: React.FC<SendToAuctionModalProps> = (
  props
) => {
  const isPooledAuction = props.invoices.length > 1;
  const [state, setState] = useState({
    minimumPrice: "0",
    minimumQuantity: "0",
    bidIncrement: "0",
    endDate: "",
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
        minimumPrice: (+target.value / +state.minimumQuantity).toString(),
      });
    } else {
      setState({
        ...state,
        [name]: value,
      });
    }
  };
  const sendToAuctionSubmit = () => {};
  return (
    <form
      onSubmit={(e) => {
        sendToAuctionSubmit();
        e.preventDefault();
      }}
    >
      <div className="send-to-auction-modal">
        <div className="modal-header">Send Auction</div>
        <button
          onClick={() => props.onModalClose()}
          className="modal-close-button"
        >
          X
        </button>
        <>
          <table className="base-table send-to-auction-modal-pooled-auction-table">
            <thead>
              <tr>
                <th scope="col">Invoice No.</th>
                <th scope="col">Payer</th>
                <th scope="col">Seller</th>
                <th scope="col">Amount</th>
                <th scope="col">Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ST23</td>
                <td>Company Name</td>
                <td>Roberto</td>
                <td>$20,000</td>
                <td>08/25/2020</td>
              </tr>
              <tr>
                <td>ST24</td>
                <td>Company Name</td>
                <td>Roberto</td>
                <td>$25,000</td>
                <td>08/25/2020</td>
              </tr>
            </tbody>
          </table>
        </>
        <div className="send-to-auction-modal-form-area">
          <InputField
            required
            name="minimumQuantity"
            label="Minimum Auction Amount ($)"
            type="text"
            onChange={handleChange}
            placeholder="e.g. 100,000"
            min="0"
            debounceTimeout={1000}
          />
          <div className="auction-modal-discount-section">
            <InputField
              required
              name="discount"
              label="Maximum Discount Rate (%)"
              type="number"
              min="0"
              max="100"
              onChange={handleChange}
              value={`${((1.0 - +state.minimumPrice) * 100).toFixed(1)}`}
              placeholder="e.g. 5"
              debounceTimeout={1000}
            />
            <div className="or">
              <div>or</div>
            </div>
            <InputField
              required
              name="minimumProceeds"
              label="Minimum Bid Amount ($)"
              type="number"
              placeholder="e.g. 10000"
              onChange={handleChange}
              value={(+state.minimumQuantity * +state.minimumPrice).toFixed(0)}
              min="0"
              debounceTimeout={1000}
            />
          </div>
          <InputField
            required
            name="bidIncrement"
            label="Minimum Bid Increment ($)"
            type="number"
            onChange={handleChange}
            placeholder="e.g. 500"
            min="0"
          />

          <div className="base-input-field">
            <label htmlFor="endDate">End Date</label>
            <input
              required
              onChange={handleChange}
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
      </div>
    </form>
  );
};
