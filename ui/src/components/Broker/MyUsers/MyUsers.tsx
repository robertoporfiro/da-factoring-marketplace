import React from "react";
import BasePage from "../../BasePage/BasePage";
import BrokerRoutes from "../BrokerRoutes";

import "./MyUsers.css";
import Add from "../../../assets/Add.svg";

let BrokerMyUsers: React.FC = () => {
  return (
    <BasePage routes={BrokerRoutes} activeRoute="Users">
      <div className="page-subheader">
        <div className="page-subheader-text"> My Users </div>
        <button className="new-user-button">
          <img src={Add}></img>Add New Users
        </button>
      </div>
      <div className="broker-users-table-container">
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
    </BasePage>
  );
};

export default BrokerMyUsers;
