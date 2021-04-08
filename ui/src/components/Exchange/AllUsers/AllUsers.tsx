import React, { useMemo } from "react";
import { RegisteredUser } from "@daml.js/daml-factoring/lib/Factoring/Registry";
//import { useRegistryLookup } from "../../common/RegistryLookup";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";

import ExchangeRoutes from "../ExchangeRoutes";

import "./AllUsers.scss";
import { AS_PUBLIC, useContractQuery } from "../../../websocket/queryStream";

const ExchangeCurrentUsersTable: React.FC = () => {
  //const registry = useRegistryLookup();
  const userContracts = useContractQuery(RegisteredUser, AS_PUBLIC);
  const users = useMemo(() => {
    return userContracts
      .map((c) => c.contractData)
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [userContracts]);

  const currentUserRows = users.map((user) => (
    <tr>
      <td>{user.firstName}</td>
      <td>{user.lastName}</td>
      <td>{user.email}</td>
      <td>{user.company}</td>
      <td>{user.roles[0].toString().slice(0, -4)}</td>
    </tr>
  ));
  return (
    <>
      <div className="table-header-text">Current Users</div>
      <table className="base-table exchange-current-users-table">
        <thead>
          <tr>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Email</th>
            <th scope="col">Company</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>{currentUserRows}</tbody>
      </table>
    </>
  );
};

const ExchangeAllUsers: React.FC<IBasePageProps> = (props) => {
  return (
    <BasePage routes={ExchangeRoutes} activeRoute="All Users" {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> All Users </div>
      </div>
      <div className="exchange-tables-container">
        <div className="exchange-current-users-table-container table-container">
          <ExchangeCurrentUsersTable />
        </div>
      </div>
    </BasePage>
  );
};

export default ExchangeAllUsers;
