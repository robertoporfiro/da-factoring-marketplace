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
import { createPortal } from "react-dom";
import { userInfo } from "os";
import { FactoringRole } from "@daml.js/da-marketplace/lib/Factoring/Utils/module";

export interface IBasePageProps {
  showLoginButton?: boolean;
  noContentPadding?: boolean;
  noContentBackgroundColor?: boolean;
  routes?: Record<string, string>;
  activeRoute?: string;
  children?: ReactNode;
  user?: Partial<RegisteredUser>;
}

const BasePage: React.FC<PropsWithChildren<IBasePageProps>> = (
  props: IBasePageProps
) => {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const history = useHistory();
  const { path } = useRouteMatch();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const onHamburgerClick = () => {
    setHamburgerOpen(!hamburgerOpen);
  };
  const NavHamburger = () => {
    return (
      <>
        {props.routes !== undefined &&
          Object.entries(props.routes).map((entry) => (
            <div
              className={`nav-hamburger-item ${
                props.activeRoute === entry[0]
                  ? "nav-hamburger-item-current"
                  : ""
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
      </>
    );
  };
  return (
    <>
      <div className="page-header">
        {props.routes !== undefined && Object.entries(props.routes).length > 0 && (
          <button className="nav-hamburger-button" onClick={onHamburgerClick}>
            ☰
          </button>
        )}

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
          {!(props.showLoginButton ?? false) && <></>}
        </div>
        <div className="profile-section">
          {!(props.showLoginButton ?? false) && (
            <>
              <div className="profile-picture">{`${
                props.user?.firstName[0] ?? "U"
              }`}</div>
              <div className="profile-greeting">
                {`Hello ${props.user?.firstName ?? ""} ${
                  "" //props.user?.lastName ?? ""
                }`}
              </div>
              <button
                className="expand-profile-menu-button"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                }}
              >
                <img className="expand-profile-button" src={ExpandMore} />
              </button>
              {showProfileMenu && (
                <div className="profile-menu">
                  {props.user &&
                    !props.user.roles.includes(FactoringRole.ExchangeRole) &&
                    !props.user.roles.includes(FactoringRole.CSDRole) && (
                      <div className={`profile-menu-item`}>
                        <Link
                          style={{
                            textDecoration: "none",
                            color: "#333",
                            fontWeight: 600,
                          }}
                          to={`/role/profile`}
                        >
                          Profile
                        </Link>
                      </div>
                    )}
                  <div className={`profile-menu-item`}>
                    <Link
                      style={{
                        textDecoration: "none",
                        color: "#333",
                        fontWeight: 600,
                      }}
                      to={`/logout`}
                    >
                      Logout
                    </Link>
                  </div>
                </div>
              )}
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
      {hamburgerOpen &&
        createPortal(
          <div
            className="nav-hamburger"
            onBlur={() => {
              setHamburgerOpen(false);
            }}
          >
            {<NavHamburger />}
          </div>,
          document.body
        )}
    </>
  );
};

export default BasePage;
