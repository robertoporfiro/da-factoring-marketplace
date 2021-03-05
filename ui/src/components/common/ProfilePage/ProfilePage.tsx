import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useLedger, useParty, useStreamQueries } from "@daml/react";

import { AssetDeposit } from "@daml.js/daml-factoring/lib/DA/Finance/Asset";
import { Seller } from "@daml.js/daml-factoring/lib/Factoring/Seller";
import { RegisteredUser } from "@daml.js/daml-factoring/lib/Factoring/Registry";

import BasePage, { IBasePageProps } from "../../BasePage/BasePage";
import { SolidButton } from "../SolidButton/SolidButton";
import { InputField } from "../InputField/InputField";
import { useOperator } from "../common";

import { formatAsCurrency, BASE_CURRENCY } from "../utils";
import {
  brokerAddFunds,
  brokerWithdrawFunds,
  buyerAddFunds,
  buyerAllocateFunds,
  buyerWithdrawFunds,
  sellerWithdrawFunds,
  userEditProfile,
} from "../factoringUtils";

import "./ProfilePage.css";
import { Buyer } from "@daml.js/daml-factoring/lib/Factoring/Buyer";
import { BrokerCustomerBuyer } from "@daml.js/daml-factoring/lib/Factoring/Broker";
import { FactoringRole } from "../FactoringRole";

const ProfilePage: React.FC<IBasePageProps> = (props) => {
  const { user } = props;
  const history = useHistory();
  const currentParty = useParty();
  const ledger = useLedger();
  const operator = useOperator();

  const [state, setState] = useState({
    userFirstName: "",
    userLastName: "",
    userEmail: "",
    userCompany: "",
    submitDisabled: false,
    walletDepositAmount: 0,
    walletWithdrawAmount: 0,
    buyerAllocateAmount: 0,
  });

  const brokerCustomerBuyerContracts = useStreamQueries(BrokerCustomerBuyer)
    .contracts;

  const assetDepositContracts = useStreamQueries(AssetDeposit).contracts.filter(
    (x) => x.payload.asset.id.label === BASE_CURRENCY
  );

  const withdrawableFunds = useMemo(() => {
    if (assetDepositContracts && assetDepositContracts.length > 0) {
      const assetDepositSum =
        assetDepositContracts.length > 0
          ? assetDepositContracts
              .map((x) => +x.payload.asset.quantity)
              .reduce((a, b) => +a + +b, 0)
          : 0;
      const brokerBuyerSum =
        brokerCustomerBuyerContracts.length > 0
          ? brokerCustomerBuyerContracts
              .map((x) => +x.payload.currentFunds)
              .reduce((a, b) => +a + +b, 0)
          : 0;
      if (props.userRole === FactoringRole.Buyer) {
        return assetDepositSum;
      } else if (props.userRole === FactoringRole.Broker) {
        return +assetDepositSum - +brokerBuyerSum;
      }
    } else {
      return 0;
    }
  }, [assetDepositContracts, brokerCustomerBuyerContracts, props.userRole]);

  const funds = useMemo(() => {
    if (assetDepositContracts && assetDepositContracts.length > 0) {
      const assetDepositSum = assetDepositContracts
        .map((x) => +x.payload.asset.quantity)
        .reduce((a, b) => +a + +b, 0);

      return assetDepositSum;
    } else {
      return 0;
    }
  }, [assetDepositContracts]);

  useEffect(() => {
    setState((state) => ({
      ...state,
      userFirstName: user?.firstName ?? "",
      userEmail: user?.email ?? "",
      userCompany: user?.company ?? "",
      userLastName: user?.lastName ?? "",
    }));
  }, [user]);

  const addFundsSubmit = async () => {
    if (props.userRole === FactoringRole.Buyer) {
      await buyerAddFunds(
        ledger,
        operator,
        currentParty,
        state.walletDepositAmount
      );
    } else if (props.userRole === FactoringRole.Broker) {
      await brokerAddFunds(
        ledger,
        operator,
        currentParty,
        state.walletDepositAmount
      );
    }

    setState({ ...state, walletDepositAmount: 0 });
  };

  const withdrawFundsSubmit = async () => {
    const depositCids = assetDepositContracts.map((x) => x.contractId);
    if (props.userRole === FactoringRole.Buyer) {
      await buyerWithdrawFunds(
        ledger,
        operator,
        currentParty,
        depositCids,
        +state.walletWithdrawAmount
      );
    } else if (props.userRole === FactoringRole.Seller) {
      await sellerWithdrawFunds(
        ledger,
        operator,
        currentParty,
        depositCids,
        +state.walletWithdrawAmount
      );
    } else if (props.userRole === FactoringRole.Broker) {
      await brokerWithdrawFunds(
        ledger,
        operator,
        currentParty,
        depositCids,
        +state.walletWithdrawAmount
      );
    }
    setState({ ...state, walletWithdrawAmount: 0 });
  };

  const userProfileEditSubmit = async () => {
    await userEditProfile(
      ledger,
      operator,
      currentParty,
      state.userCompany,
      state.userFirstName,
      state.userLastName,
      state.userEmail
    );
    setState({ ...state, submitDisabled: false });
  };

  const buyerAllocateFundsSubmit = async () => {
    const depositCids = assetDepositContracts.map((x) => x.contractId);
    await buyerAllocateFunds(
      ledger,
      currentParty,
      depositCids,
      state.buyerAllocateAmount
    );
    setState({ ...state, buyerAllocateAmount: 0 });
  };

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setState({
      ...state,
      [name]: value,
    });
  };

  return (
    <BasePage activeRoute="" noContentBackgroundColor={false} {...props}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Profile </div>
        <Link
          className="back-to-auction-link"
          to="#"
          onClick={(e) => {
            e.preventDefault();
            history.goBack();
          }}
        >
          ⟵ Back
        </Link>
      </div>
      <div className={`profile-page-container`}>
        <div className="user-profile-edit-section">
          <form
            onSubmit={async (e) => {
              setState({ ...state, submitDisabled: true });
              await userProfileEditSubmit();
              e.preventDefault();
            }}
          >
            <div className="user-profile-edit-section-subheader">
              Edit Details
            </div>
            <div className="user-profile-edit-name-section">
              <InputField
                required
                label="First Name"
                name="userFirstName"
                value={state.userFirstName}
                onChange={handleChange}
                disabled={state.submitDisabled}
              />
              <InputField
                required
                label="Last Name"
                name="userLastName"
                value={state.userLastName}
                onChange={handleChange}
                disabled={state.submitDisabled}
              />
            </div>
            <InputField
              required
              type="email"
              label="Email"
              name="userEmail"
              value={state.userEmail}
              onChange={handleChange}
              disabled={state.submitDisabled}
            />
            <InputField
              required
              label="Company"
              name="userCompany"
              value={state.userCompany}
              onChange={handleChange}
              disabled={state.submitDisabled}
            />
            <SolidButton
              label="Submit"
              type="submit"
              className="user-profile-edit-submit-button"
              disabled={state.submitDisabled}
            />
          </form>
        </div>
        {funds !== null && (
          <>
            <div className="profile-section-gap-divider"></div>
            <div className="user-funds-info-section">
              <div className="user-funds-info-section-subheader">Funds</div>
              <div className="user-funds-info-balance-section">
                <div className="asset-info">
                  <div className="asset-label">{BASE_CURRENCY}</div>

                  <div className="asset-section-gap-divider"></div>
                  <div className="wallet-info">
                    <div className="wallet-balance">
                      <div className="wallet-balance-label">{`Your Balance`}</div>
                      <div className="wallet-balance-data">{`${formatAsCurrency(
                        funds ?? 0
                      )}`}</div>
                      {props.userRole === FactoringRole.Broker && (
                        <>
                          <div className="wallet-balance-label">{`Buyer Funds`}</div>
                          <div className="wallet-balance-data">{`${formatAsCurrency(
                            (+funds ?? 0) - (+withdrawableFunds ?? 0)
                          )}`}</div>
                        </>
                      )}
                    </div>

                    <div className="wallet-actions">
                      {(props.userRole === FactoringRole.Buyer ||
                        props.userRole === FactoringRole.Broker) && (
                        <div className="wallet-actions-add-funds-row">
                          <InputField
                            type="number"
                            min="0"
                            label="Enter Amount"
                            name="walletDepositAmount"
                            value={state.walletDepositAmount}
                            onChange={handleChange}
                          />
                          <SolidButton
                            className="wallet-actions-add-funds"
                            label="Deposit Funds"
                            onClick={addFundsSubmit}
                            disabled={!(+state.walletDepositAmount > 0)}
                          />
                        </div>
                      )}
                      <div className="wallet-actions-withdraw-funds-row">
                        <InputField
                          type="number"
                          min="0"
                          label="Enter Amount"
                          name="walletWithdrawAmount"
                          value={state.walletWithdrawAmount}
                          onChange={handleChange}
                        />
                        <SolidButton
                          className="wallet-actions-withdraw-funds"
                          label="Withdraw Funds"
                          onClick={withdrawFundsSubmit}
                          disabled={
                            !(+state.walletWithdrawAmount > 0) ||
                            +state.walletWithdrawAmount >
                              (+withdrawableFunds ?? 0)
                          }
                        />
                      </div>
                      {props.userRole === FactoringRole.Buyer && (
                        <div className="wallet-actions-allocate-funds-row">
                          <InputField
                            type="number"
                            min="0"
                            label="Enter Amount"
                            name="buyerAllocateAmount"
                            value={state.buyerAllocateAmount}
                            onChange={handleChange}
                          />
                          <SolidButton
                            className="wallet-actions-withdraw-funds"
                            label="Allocate To Broker"
                            disabled={
                              !(+state.buyerAllocateAmount > 0) ||
                              +state.buyerAllocateAmount > (+funds ?? 0)
                            }
                            onClick={buyerAllocateFundsSubmit}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BasePage>
  );
};

export default ProfilePage;
