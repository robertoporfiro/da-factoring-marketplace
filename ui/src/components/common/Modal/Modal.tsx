import React, { InputHTMLAttributes } from "react";
import { createPortal } from "react-dom";

import "./Modal.scss";

export interface ModalProps extends InputHTMLAttributes<HTMLInputElement> {
  modalOpen: boolean;
}
export const Modal: React.FC<ModalProps> = ({ modalOpen, ...inputProps }) => {
  return (
    modalOpen && createPortal(<div className="modal">{""}</div>, document.body)
  );
};
