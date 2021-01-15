import React from "react";
import BasePage from "../BasePage/BasePage";
import { SolidButton } from "../common/SolidButton/SolidButton";

import "./TermsAndConditions.css";

const TermsAndConditions: React.FC = () => (
  <BasePage activeRoute="" noContentBackgroundColor={false}>
    <div className="page-subheader">
      <div className="page-subheader-text"> Terms And Conditions </div>
    </div>
    <div className="terms-and-conditions-text-box">
      <div>
        <div className="terms-and-conditions-text-box-header">
          Title of content
        </div>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
      </div>
      <div>
        <div className="terms-and-conditions-text-box-header">
          Title of content
        </div>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged.
        </p>
        <p>
          It was popularised in the 1960s with the release of Letraset sheets
          containing Lorem Ipsum passages, and more recently with desktop
          publishing software like Aldus PageMaker including versions of Lorem
          Ipsum.
        </p>
      </div>
      <div>
        <div className="terms-and-conditions-text-box-header">
          Title of content
        </div>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Natus odio
          incidunt ea ipsum voluptatem velit doloribus modi ullam nihil error?
          Atque asperiores ullam cum provident beatae, voluptate quas nostrum
          itaque?
        </p>
      </div>
      <div className="terms-and-conditions-broker-select-section">
        <div className="terms-and-conditions-text-box-header">
          Select a Broker
        </div>
        <select className="terms-and-conditions-broker-select"></select>
        <SolidButton
          className="terms-and-conditions-accept-button"
          label="I Accept"
        />
      </div>
    </div>
  </BasePage>
);

export default TermsAndConditions;
