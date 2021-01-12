import React, { ChangeEvent, useState } from "react";
import BasePage from "../../BasePage/BasePage";
import BrokerRoutes from "../BrokerRoutes";

import "./MyUsers.css";
import Add from "../../../assets/Add.svg";
import { InputField } from "../../common/InputField/InputField";
import { createPortal } from "react-dom";
import { SolidButton } from "../../common/SolidButton/SolidButton";

let BrokerMyUsers: React.FC = () => {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserFormState, setNewUserFormState] = useState({});

  const handleNewUserFormChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    setNewUserFormState({
      ...newUserFormState,
      [name]: target.value,
    });
  };

  const userModal = (
    <div className="user-modal">
      <div className="modal-header">Add New User</div>
      <button
        onClick={() => setUserModalOpen(false)}
        className="modal-close-button"
      >
        X
      </button>
      <InputField
        name="firstName"
        label="First Name"
        type="text"
        onChange={handleNewUserFormChange}
        placeholder="e.g. Jonathan"
      />
      <InputField
        name="lastName"
        label="Last Name"
        type="text"
        onChange={handleNewUserFormChange}
        placeholder="e.g. 100000"
      />
      <InputField
        name="email"
        label="Email"
        type="text"
        onChange={handleNewUserFormChange}
        placeholder="e.g. roberto@gmail.com"
      />
      <InputField
        name="companyName"
        label="Company Name"
        type="text"
        onChange={handleNewUserFormChange}
        placeholder="e.g. Company Name"
      />
      <InputField
        name="role"
        label="Select Role"
        type="text"
        onChange={handleNewUserFormChange}
        placeholder="e.g. Buyer"
      />

      <SolidButton
        label="Create"
        onClick={() => {}}
        className="user-modal-create-button"
      ></SolidButton>
    </div>
  );

  return (
    <BasePage routes={BrokerRoutes} activeRoute="Users">
      <div className="page-subheader">
        <div className="page-subheader-text"> My Users </div>
        <button
          className="new-user-button"
          onClick={() => setUserModalOpen(true)}
        >
          <img alt="" src={Add}></img>Add New Users
        </button>
      </div>
      <div className="broker-users-table-container table-container">
        <table className="base-table broker-users-table">
          <thead>
            <tr>
              <th scope="col">S.N</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Company</th>
              <th scope="col">Invoice Balance</th>
              <th scope="col">Cash Balance</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Roberto</td>
              <td>roberto@gmail.com</td>
              <td>Company Name</td>
              <td>$55,800</td>
              <td>$86,500</td>
              <td>
                <div className="broker-users-table-role-box"> Buyer </div>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Roberto</td>
              <td>roberto@gmail.com</td>
              <td>Company Name</td>
              <td>$55,800</td>
              <td>$86,500</td>
              <td>
                <div className="broker-users-table-role-box"> Buyer </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {userModalOpen &&
        createPortal(<div className="modal">{userModal}</div>, document.body)}
    </BasePage>
  );
};

export default BrokerMyUsers;
