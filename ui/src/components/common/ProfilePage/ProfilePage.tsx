import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";

import "./ProfilePage.css";

import { RegisteredUser } from "@daml.js/da-marketplace/lib/Factoring/Registry";
import { useLedger, useParty, useStreamQueries } from "@daml/react";
import { SolidButton } from "../SolidButton/SolidButton";
import { InputField } from "../InputField/InputField";
import { useOperator } from "../common";
import {
  Buyer,
  BuyerWallet,
  Buyer_RequestDeposit,
} from "@daml.js/da-marketplace/lib/Factoring/Buyer";
import { formatAsCurrency } from "../utils";
import { AssetDeposit } from "@daml.js/da-marketplace/lib/DA/Finance/Asset";
import { ContractId } from "@daml/types";
import { Link, useHistory } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const history = useHistory();
  const userContracts = useStreamQueries(RegisteredUser).contracts;
  const buyerWalletContracts = useStreamQueries(BuyerWallet).contracts;
  const [user, setUser] = useState<RegisteredUser>();
  const [buyerWallet, setBuyerWallet] = useState<
    BuyerWallet & { buyerWalletCid: ContractId<BuyerWallet> }
  >();
  const [assetDeposit, setAssetDeposit] = useState<AssetDeposit>();
  const party = useParty();
  const ledger = useLedger();
  const operator = useOperator();

  useEffect(() => {
    const userPayload = userContracts[0]?.payload;
    if (userPayload) {
      setUser(userPayload);
    }
  }, [userContracts]);
  useEffect(() => {
    if (buyerWalletContracts.length > 0) {
      const buyerWalletContract = buyerWalletContracts[0];
      setBuyerWallet({
        ...buyerWalletContract.payload,
        buyerWalletCid: buyerWalletContract.contractId,
      });
      const fetchAssetDeposit = async () => {
        const assetDeposit = await ledger.fetch(
          AssetDeposit,
          (buyerWalletContract.payload
            .depositCid as unknown) as ContractId<AssetDeposit>
        );
        if (assetDeposit?.payload) {
          setAssetDeposit(assetDeposit.payload);
        }
      };
      fetchAssetDeposit();
    }
  }, [buyerWalletContracts, ledger]);

  const [state, setState] = useState({
    userFirstName: "",
    userLastName: "",
    userEmail: "",
    userCompany: "",
    submitDisabled: false,
    walletBalace: 0,
    walletAddAmount: 0,
  });

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setState({
      ...state,
      [name]: value,
    });
  };
  const buyerAddMoneySubmit = async () => {
    console.log("Adding Money");
    try {
      await buyerAddMoney(state.walletAddAmount);
    } catch (e) {}
    setState({ ...state, walletAddAmount: 0 });
  };
  const buyerAddMoney = async (amount: number) => {
    try {
      await ledger.exerciseByKey(
        Buyer.Buyer_RequestDeposit,
        { _1: operator, _2: party },
        { amount: `${(+amount).toFixed(0)}` }
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setState((state) => ({
      ...state,
      userFirstName: user?.firstName ?? "",
      userEmail: user?.email ?? "",
      userCompany: user?.company ?? "",
      userLastName: user?.lastName ?? "",
    }));
  }, [user]);
  const userProfileEditSubmit = async () => {
    try {
      await ledger.exerciseByKey(
        RegisteredUser.RegisteredUser_UpdateProfile,
        { _1: operator, _2: party },
        {
          newCompany: state.userCompany,
          newFirstName: state.userFirstName,
          newLastName: state.userLastName,
          newEmail: state.userEmail,
        }
      );
    } catch (e) {}
    setState({ ...state, submitDisabled: false });
  };
  return (
    <BasePage activeRoute="" noContentBackgroundColor={false}>
      <div className="page-subheader">
        <div className="page-subheader-text"> Profile </div>
        <Link
          className="back-to-auction-link"
          to="#"
          onClick={() => {
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
        {buyerWallet && (
          <>
            <div className="profile-section-gap-divider"></div>
            <div className="user-funds-info-section">
              <div className="user-funds-info-section-subheader">Funds</div>
              <div className="user-funds-info-balance-section">
                <div className="asset-info">
                  <div className="asset-label">
                    {assetDeposit?.asset?.id.label ?? "USD"}
                  </div>

                  <div className="asset-section-gap-divider"></div>
                  <div className="wallet-info">
                    <div className="wallet-balance">
                      <div className="wallet-balance-label">{`Your Balance`}</div>
                      <div className="wallet-balance-data">{`${formatAsCurrency(
                        buyerWallet?.funds ?? 0
                      )}`}</div>
                    </div>

                    <div className="wallet-actions">
                      <InputField
                        type="number"
                        min="0"
                        label="Add Funds"
                        name="walletAddAmount"
                        value={state.walletAddAmount}
                        onChange={handleChange}
                      />
                      <SolidButton
                        className="wallet-actions-add-funds"
                        label="Add Funds"
                        onClick={buyerAddMoneySubmit}
                      />
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
