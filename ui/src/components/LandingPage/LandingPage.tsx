import React from "react";
import BasePage from "../BasePage/BasePage";

import "./LandingPage.css";
import Landing1 from "../../assets/Landing1.png";
import Landing2 from "../../assets/Landing2.png";

let LandingPage: React.FC = () => {
  return (
    <BasePage
      activeRoute=""
      showLoginButton={true}
      noContentPadding={true}
      noContentBackgroundColor={true}
    >
      <img className="landing-large-banner" src={Landing1} />
      <div className="feature-list">
        <div className="feature-list-item item-1">
          <img className="landing-feature-banner" src={Landing2} />
          <div className="feature-card-list item-2">
            <div className="feature-card">
              <div className="feature-card-header">Get Easy Loan</div>
              <div className="feature-card-content">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta
                eius quis eaque quaerat ut quo dolorem qui laboriosam explicabo
                distinctio vitae dicta deleniti, cumque sequi iste facilis amet
                ad saepe?
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-card-header">Get Good Rates</div>
              <div className="feature-card-content">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta
                eius quis eaque quaerat ut quo dolorem qui laboriosam explicabo
                distinctio vitae dicta deleniti, cumque sequi iste facilis amet
                ad saepe?
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-card-header">Transparent</div>
              <div className="feature-card-content">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta
                eius quis eaque quaerat ut quo dolorem qui laboriosam explicabo
                distinctio vitae dicta deleniti, cumque sequi iste facilis amet
                ad saepe?
              </div>
            </div>
          </div>
        </div>
        <div className="feature-list-item">
          <div className="feature-list-item-header">How it works</div>
        </div>
        <div className="feature-list-item">
          <div className="feature-list-item-header">Why choose Factoronx</div>
        </div>
      </div>
    </BasePage>
  );
};

export default LandingPage;
