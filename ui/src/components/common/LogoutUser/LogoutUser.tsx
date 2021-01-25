import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

export const LogoutUser = (props) => {
  const history = useHistory();
  props.onLogout();
  history.replace("/");
  return <> </>;
};
