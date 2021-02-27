import React from "react";
import { useHistory } from "react-router-dom";

const LogoutUser = (props) => {
  const history = useHistory();
  props.onLogout();
  history.replace("/");
  return <> </>;
};
export default LogoutUser;
