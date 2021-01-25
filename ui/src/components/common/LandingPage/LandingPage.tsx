import React from "react";
import BasePage from "../../BasePage/BasePage";

import "./LandingPage.css";
import Landing1 from "../../../assets/Landing1.png";
import Landing2 from "../../../assets/Landing2.png";
import Loan from "../../../assets/loan.png";
import Walmart from "../../../assets/Walmart.svg";

let LandingPage: React.FC = () => {
  const InvestorCard = (imageSource) => (
    <div className="investor-card">
      <img alt="" className="investor-card-image" src={imageSource} />
    </div>
  );
  const StatCard = (header, data) => (
    <div className="stat-card">
      <div className="stat-card-text">
        <div className="stat-card-header">{header}</div>
        <div className="stat-card-data">{data}</div>
      </div>
      <div className="stat-card-icon">
        <img alt="" className="stat-card-icon-image" src={Loan} />
      </div>
    </div>
  );
  const FeatureCard = (text, header?) => (
    <div
      className={`feature-card ${
        header ?? false ? "" : "feature-card-no-header"
      }`}
    >
      <div className="feature-card-icon">
        <img alt="" className="feature-card-icon-image" src={Loan} />
      </div>
      {(header ?? false) && (
        <>
          <div className="feature-card-text">
            <div className="feature-card-header">{header}</div>
            <div className="feature-card-content">{text}</div>
          </div>
        </>
      )}
      {!(header ?? false) && (
        <>
          <div className="feature-card-text">
            <div className="feature-card-content">{text}</div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <BasePage
      activeRoute=""
      showLoginButton={true}
      noContentPadding={true}
      noContentBackgroundColor={true}
    >
      <img alt="" className="landing-large-banner" src={Landing1} />
      <div className="feature-list">
        <div className="feature-list-item item-1">
          <img alt="" className="landing-feature-banner" src={Landing2} />
          <div className="feature-card-list-column">
            {[
              FeatureCard(
                "It is a long established fact that a reader will be distracted by the layout.",
                "Get Easy Loan"
              ),
              FeatureCard(
                "It is a long established fact that a reader will be distracted by the layout.",
                "Good Rates"
              ),
              FeatureCard(
                "It is a long established fact that a reader will be distracted by the layout.",
                "Transparent"
              ),
            ]}
          </div>
        </div>
        <div className="feature-list-item">
          <div className="feature-list-item-header">How it works</div>
          <div className="feature-card-list-row">
            {[
              FeatureCard(
                "It is a long established fact that a reader will be distracted by the layout."
              ),
              FeatureCard(
                "It is a long established fact that a reader will be distracted by the layout."
              ),
              FeatureCard(
                "It is a long established fact that a reader will be distracted by the layout."
              ),
            ]}
          </div>
        </div>
        <div className="feature-list-item">
          <div className="feature-list-item-header">Why choose Factoronx</div>
          <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis,
            iste molestiae illo officiis nulla debitis commodi impedit dolorum,
            inventore voluptatum temporibus sunt non excepturi magni officia
            maiores blanditiis quas fugiat!
          </div>
          <div className="stat-card-list">
            {[
              StatCard("Total Buyers", "190"),
              StatCard("Total Auctions", "1390"),
              StatCard("Total Sellers", "456"),
            ]}
          </div>
        </div>
        <div className="feature-list-item">
          <div className="feature-list-item-header">Our Top Investors</div>
          <div className="investor-list">
            {[
              InvestorCard(Walmart),
              InvestorCard(Walmart),
              InvestorCard(Walmart),
              InvestorCard(Walmart),
              InvestorCard(Walmart),
              InvestorCard(Walmart),
            ]}
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default LandingPage;
