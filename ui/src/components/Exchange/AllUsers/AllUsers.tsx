import {
  RegisteredBuyer,
  RegisteredSeller,
  RegisteredUser,
} from "@daml.js/da-marketplace/lib/Factoring/Registry";
import { useStreamQueryAsPublic } from "@daml/dabl-react";
import React, { useMemo } from "react";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import OutlineRoleBox from "../../common/OutlineRoleBox/OutlineRoleBox";
import { useRegistryLookup } from "../../common/RegistryLookup";
import ExchangeRoutes from "../ExchangeRoutes";

import "./AllUsers.css";
import AssignRole from "./AssignRole";

/*
const ExchangeNewUsersTable: React.FC = () => {
  return (
    <>
      <div className="table-header-text">New Users</div>
      <table className="base-table exchange-new-users-table">
        <thead>
          <tr>
            <th scope="col">S.N.</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Company</th>
            <th scope="col">Assign Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Smith</td>
            <td>Roberto</td>
            <td>roberto@gmail.com</td>
            <td>Here is company name</td>
            <td>
              <AssignRole />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

const ExchangePendingUsersTable: React.FC = () => {
  return (
    <>
      <div className="table-header-text">Pending Users</div>
      <table className="base-table exchange-pending-users-table">
        <thead>
          <tr>
            <th scope="col">S.N.</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Company</th>
            <th scope="col">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Smith</td>
            <td>Roberto</td>
            <td>roberto@gmail.com</td>
            <td>Here is company name</td>
            <td>
              <OutlineRoleBox role="Buyer" />
            </td>
          </tr>
          <tr>
            <td>Smith1</td>
            <td>Roberto1</td>
            <td>roberto1@gmail.com</td>
            <td>Here is company1 name</td>
            <td>
              <OutlineRoleBox role="Buyer" />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
*/

const ExchangeCurrentUsersTable: React.FC = () => {
  const registry = useRegistryLookup();
  const userContracts = useStreamQueryAsPublic(RegisteredUser).contracts;
  const users = useMemo(() => {
    return userContracts
      .map((c) => c.payload)
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [userContracts]);

  const currentUserRows = users.map((user) => (
    <tr>
      <td>{user.firstName}</td>
      <td>{user.lastName}</td>
      <td>{user.email}</td>
      <td>{user.company}</td>
      <td>
        <OutlineRoleBox role={user.roles[0].toString().slice(0, -4)} />
      </td>
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
