import React, { useEffect } from "react";
import BasePage from "../../BasePage/BasePage";

import "./LandingPage.css";
import Landing1 from "../../../assets/Landing1.png";
import Landing2 from "../../../assets/Landing2.png";
import Loan from "../../../assets/loan.png";
import Walmart from "../../../assets/Walmart.svg";

import { ledgerId } from "../../../config";
import { useHistory, useLocation } from "react-router-dom";
import Credentials from "../../../Credentials";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function getTokenFromCookie(): string {
  const tokenCookiePair =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("DABL_LEDGER_ACCESS_TOKEN")) || "";
  return tokenCookiePair.slice(tokenCookiePair.indexOf("=") + 1);
}

type Props = {
  onLogin: (credentials: Credentials) => void;
};


let LandingPage: React.FC<Props> = ({onLogin}) => {

  const history = useHistory();
  const query = useQuery();
  const location = window.location;

  useEffect(() => {
    const url = new URL(window.location.href);
    console.log(url);

    // When DABL login redirects back to app, hoist the query into the hash route.
    // This allows react-router's HashRouter to see and parse the supplied params

    // i.e., we want to turn
    // ledgerid.projectdabl.com/?party=party&token=token/#/
    // into
    // ledgerid.projectdabl.com/#/?party=party&token=token
    if (url.search !== "" && url.hash === "#/") {
        window.location.href = `${url.origin}${url.pathname}#/${url.search}`;
    }
  }, [location]);

  useEffect(() => {
    const party = query.get("party");
    // const token = query.get("token");
    const token = getTokenFromCookie();

    if (!token || !party) {
      return;
    }

    onLogin({ token, party, ledgerId });
    history.push("/role");
  }, [onLogin, query, history]);

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
