import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import BasePage, { IBasePageProps } from "../../BasePage/BasePage";

import "./ProfilePage.css";

import { RegisteredUser } from "@daml.js/da-marketplace/lib/Factoring/Registry";
import { useStreamQueries } from "@daml/react";

const ProfilePage: React.FC = () => {
  const userContracts = useStreamQueries(RegisteredUser).contracts;
  const [user, setUser] = useState<RegisteredUser>();
  useEffect(() => {
    const userPayload = userContracts[0]?.payload;
    if (userPayload) {
      setUser(userPayload);
    }
  }, [userContracts]);

  return <BasePage></BasePage>;
};

export default ProfilePage;
