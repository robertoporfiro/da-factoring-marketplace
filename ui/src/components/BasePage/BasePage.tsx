import React, { PropsWithChildren, ReactNode } from "react";

import "./BasePage.css";

import AppLogoWide from "../../assets/LogoWide.svg";
import ExpandMore from "../../assets/ExpandMore.svg";
import DefaultProfilePicture from "../../assets/profile.jpg";
import { useHistory } from "react-router-dom";

interface IBasePageProps {
  showLoginButton?: boolean;
  noContentPadding?: boolean;
  noContentBackgroundColor?: boolean;
  routes?: Record<string, string>;
  activeRoute?: string;
  children: ReactNode;
}

let BasePage: React.FC<PropsWithChildren<IBasePageProps>> = (
  props: IBasePageProps
) => {
  const history = useHistory();
  return (
    <>
      <div className="page-header">
        <img className="app-logo" src={AppLogoWide} />
        <div className="nav-menu">
          {props.routes !== undefined &&
            Object.entries(props.routes).map((entry) => (
              <div
                className={`nav-menu-item ${
                  props.activeRoute === entry[0] ? "nav-menu-item-current" : ""
                }`}
                key={entry[0]}
              >
                {entry[0]}
              </div>
            ))}
        </div>
        <div className="profile-section">
          {!(props.showLoginButton ?? false) && (
            <>
              <img className="profile-picture" src={DefaultProfilePicture} />
              <div className="profile-greeting">Hello FirstName</div>
              <img className="expand-profile-button" src={ExpandMore} />
            </>
          )}
          {(props.showLoginButton ?? false) && (
            <>
              <button
                onClick={() => {
                  history.push("/login");
                }}
                className="profile-login-button"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
      <div
        className={`page-content ${
          props.noContentPadding ?? false ? "no-content-padding" : ""
        } ${
          props.noContentBackgroundColor ?? false
            ? "no-content-background-color"
            : ""
        }`}
      >
        {props.children}
      </div>
      <div
        className={`page-footer ${
          props.noContentBackgroundColor ?? false
            ? "no-content-background-color"
            : ""
        }`}
      >
        © 2020 factoring
      </div>
    </>
  );
};

export default BasePage;
