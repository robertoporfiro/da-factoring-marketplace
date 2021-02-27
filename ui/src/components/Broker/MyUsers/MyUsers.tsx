import React, { ChangeEvent, useMemo, useState } from "react";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import BrokerRoutes from "../BrokerRoutes";

import { InputField } from "../../common/InputField/InputField";
import { createPortal } from "react-dom";
import { SolidButton } from "../../common/SolidButton/SolidButton";
import { useStreamQueries } from "@daml/react";
import {
  BrokerCustomerBuyer,
  BrokerCustomerSeller,
} from "@daml.js/daml-factoring/lib/Factoring/Broker";
import "./MyUsers.css";
import { useRegistryLookup } from "../../common/RegistryLookup";
import {
  RegisteredBuyer,
  RegisteredSeller,
} from "@daml.js/daml-factoring/lib/Factoring/Registry";
import { FactoringRole } from "../../common/FactoringRole";

import { formatAsCurrency } from "../../common/utils";

const BrokerMyUsers: React.FC<IBasePageProps> = (props) => {
  const registry = useRegistryLookup();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserFormState, setNewUserFormState] = useState({});

  const brokerCustomerBuyerContracts = useStreamQueries(BrokerCustomerBuyer)
    .contracts;
  const brokerCustomerSellerContracts = useStreamQueries(BrokerCustomerSeller)
    .contracts;
  const brokerBuyers = useMemo(
    () =>
      brokerCustomerBuyerContracts.map((c) => {
        return {
          ...registry.buyerMap.get(c.payload.brokerCustomer),
          currentFunds: c.payload.currentFunds,
        };
      }),
    [brokerCustomerBuyerContracts, registry.buyerMap]
  );
  const brokerSellers = useMemo(
    () =>
      brokerCustomerSellerContracts.map((c) =>
        registry.sellerMap.get(c.payload.brokerCustomer)
      ),
    [brokerCustomerSellerContracts, registry.sellerMap]
  );
  const myUsers = useMemo(() => {
    for (const buyer of brokerBuyers) {
      if (buyer) (buyer as any).role = FactoringRole.Buyer;
    }

    for (const seller of brokerSellers) {
      if (seller) (seller as any).role = FactoringRole.Seller;
    }
    const allUsers: Array<
      Partial<RegisteredBuyer | RegisteredSeller>
    > = brokerBuyers.concat(brokerSellers as any[]);
    return allUsers;
  }, [brokerBuyers, brokerSellers]);
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

  const myUsersRows = myUsers.map((user) => (
    <tr
      key={
        (user as RegisteredBuyer)?.buyer || (user as RegisteredSeller)?.seller
      }
    >
      <td>{user?.firstName}</td>
      <td>{user?.lastName}</td>
      <td>{user?.email}</td>
      <td>{user?.company}</td>
      <td>$55,800</td>
      <td>
        {(user as any)?.currentFunds
          ? formatAsCurrency((user as any)?.currentFunds)
          : "-"}
      </td>
      <td>{(user as any)?.role ?? ""}</td>
    </tr>
  ));

  return (
    <BasePage routes={BrokerRoutes} activeRoute="Users" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> My Users </div>
      </div>
      <div className="broker-users-table-container table-container">
        <table className="base-table broker-users-table">
          <thead>
            <tr>
              <th scope="col">First Name</th>
              <th scope="col">Last Name</th>
              <th scope="col">Email</th>
              <th scope="col">Company</th>
              <th scope="col">Invoice Balance</th>
              <th scope="col">Cash Balance</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>{myUsersRows}</tbody>
        </table>
      </div>
      {userModalOpen &&
        createPortal(<div className="modal">{userModal}</div>, document.body)}
    </BasePage>
  );
};

export default BrokerMyUsers;
