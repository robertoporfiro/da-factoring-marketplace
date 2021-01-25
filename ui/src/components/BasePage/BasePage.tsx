import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from "react";

import "./BasePage.css";

import AppLogoWide from "../../assets/LogoWide.svg";
import AppLogoSmall from "../../assets/LogoSmall.svg";
import ExpandMore from "../../assets/ExpandMore.svg";
import DefaultProfilePicture from "../../assets/profile.jpg";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { useParty, useStreamQueries } from "@daml/react";
import { useRegistryLookup } from "../common/RegistryLookup";
import { RegisteredUser } from "@daml.js/da-marketplace/lib/Factoring/Registry";

export interface IBasePageProps {
  showLoginButton?: boolean;
  noContentPadding?: boolean;
  noContentBackgroundColor?: boolean;
  routes?: Record<string, string>;
  activeRoute?: string;
  children?: ReactNode;
  user?: RegisteredUser;
}

let BasePage: React.FC<PropsWithChildren<IBasePageProps>> = (
  props: IBasePageProps
) => {
  const history = useHistory();
  const { path } = useRouteMatch();

  return (
    <>
      <div className="page-header">
        <img className="app-logo-wide" src={AppLogoWide} alt="Factoronx" />
        <img className="app-logo-small" src={AppLogoSmall} alt="Factoronx" />
        <div className="nav-menu">
          {props.routes !== undefined &&
            Object.entries(props.routes).map((entry) => (
              <div
                className={`nav-menu-item ${
                  props.activeRoute === entry[0] ? "nav-menu-item-current" : ""
                }`}
                key={entry[0]}
              >
                <Link
                  style={{ textDecoration: "none", color: "#ffffff" }}
                  to={`${entry[1]}`}
                >
                  {entry[0]}
                </Link>
              </div>
            ))}
          <div className={`nav-menu-item`}></div>
        </div>
        <div className="profile-section">
          {!(props.showLoginButton ?? false) && (
            <>
              <img className="profile-picture" src={DefaultProfilePicture} />
              <div className="profile-greeting">
                {`Hello ${props.user?.firstName ?? ""} ${
                  props.user?.lastName ?? ""
                }User`}
              </div>
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
