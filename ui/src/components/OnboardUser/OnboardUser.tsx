import { InvitationRequest } from "@daml.js/daml-factoring/lib/Factoring/Onboarding";
import { FactoringRole } from "@daml.js/daml-factoring/lib/Factoring/Utils/module";
import { useLedger, useParty } from "@daml/react";
import React, { ChangeEvent, useEffect, useState } from "react";
import BasePage from "../BasePage/BasePage";
import { useOperator } from "../common/common";
import { InputField } from "../common/InputField/InputField";
import { useRegistryLookup } from "../common/RegistryLookup";
import { SolidButton } from "../common/SolidButton/SolidButton";

import "./OnboardUser.scss";

const OnboardUser: React.FC = () => {
  const registry = useRegistryLookup();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    userFirstName: "",
    userLastName: "",
    userEmail: "",
    userCompany: "",
    userRole: "SellerRole",
    submitDisabled: false,
    broker: null,
  });
  const party = useParty();
  const ledger = useLedger();
  const operator = useOperator();
  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const createInvitation = async () => {
    const request = {
      operator: operator,
      user: party,
      firstName: state.userFirstName,
      lastName: state.userLastName,
      company: state.userCompany,
      email: state.userEmail,
      role: state.userRole as FactoringRole,
      optBroker: state.broker,
    };
    await ledger.create(InvitationRequest, request);
  };
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  return (
    <>
      {loading && "Loading..."}
      {!loading && (
        <BasePage
          activeRoute=""
          noContentBackgroundColor={false}
          showLoginButton={true}
        >
          <div className="page-subheader">
            <div className="page-subheader-text"> Register </div>
          </div>
          <div
            className={`terms-and-conditions-text-box ${
              !loading ? "terms-and-conditions-text-box-loaded" : ""
            }`}
          >
            <form
              onSubmit={async (e) => {
                setState({ ...state, submitDisabled: true });
                createInvitation();
                e.preventDefault();
              }}
            >
              <div className="user-onboarding-section">
                <div>Enter Details</div>
                <div className="user-onboarding-register-name-section">
                  <InputField
                    required
                    label="First Name"
                    name="userFirstName"
                    onChange={handleChange}
                    disabled={state.submitDisabled}
                  />
                  <InputField
                    required
                    label="Last Name"
                    name="userLastName"
                    onChange={handleChange}
                    disabled={state.submitDisabled}
                  />
                </div>
                <InputField
                  required
                  type="email"
                  label="Email"
                  name="userEmail"
                  onChange={handleChange}
                  disabled={state.submitDisabled}
                />
                <InputField
                  required
                  label="Company"
                  name="userCompany"
                  onChange={handleChange}
                  disabled={state.submitDisabled}
                />
                <div className="user-onboarding-register-select-role-section">
                  <div>Select Role</div>
                  <select
                    className="input-field"
                    name="userRole"
                    required
                    onChange={handleChange}
                    disabled={state.submitDisabled}
                  >
                    <option value="SellerRole">Seller</option>
                    <option value="BuyerRole">Buyer</option>
                    <option value="BrokerRole">Broker</option>
                  </select>
                </div>
                <div className="user-onboarding-register-select-role-section">
                  <div>Select Broker</div>
                  <select
                    className="input-field"
                    name="broker"
                    required
                    onChange={handleChange}
                    disabled={
                      state.submitDisabled || state.userRole === "BrokerRole"
                    }
                  >
                    <option>None</option>
                    {[...registry.brokerMap.values()].map((broker) => (
                      <option key={broker.broker} value={broker.broker}>
                        {broker.firstName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  By clicking Register, you agree to the below terms and
                  conditions:
                </div>
              </div>
              <div className="terms-and-conditions-section">
                <div>
                  <div className="terms-and-conditions-text-box-header">
                    Terms And Conditions
                  </div>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularised in the 1960s with
                    the release of Letraset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                </div>
                <div>
                  <div className="terms-and-conditions-text-box-header">
                    Title of content
                  </div>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged.
                  </p>
                  <p>
                    It was popularised in the 1960s with the release of Letraset
                    sheets containing Lorem Ipsum passages, and more recently
                    with desktop publishing software like Aldus PageMaker
                    including versions of Lorem Ipsum.
                  </p>
                </div>
                <div>
                  <div className="terms-and-conditions-text-box-header">
                    Title of content
                  </div>
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Natus odio incidunt ea ipsum voluptatem velit doloribus modi
                    ullam nihil error? Atque asperiores ullam cum provident
                    beatae, voluptate quas nostrum itaque?
                  </p>
                </div>
                {/*<div className="terms-and-conditions-broker-select-section">
        <div className="terms-and-conditions-text-box-header">
          Select a Broker
        </div>
        <select className="terms-and-conditions-broker-select"></select>
        <SolidButton
          className="terms-and-conditions-accept-button"
          label="I Accept"
        />
        </div>*/}
              </div>
              <SolidButton
                label="Register"
                type="submit"
                className="user-onboarding-register-submit-button"
                disabled={state.submitDisabled}
              />
            </form>
          </div>
        </BasePage>
      )}
    </>
  );
};

export default OnboardUser;
