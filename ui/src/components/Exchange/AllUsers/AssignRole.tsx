import React from "react";

import "./AssignRole.scss";

const AssignRole: React.FC = () => {
  return (
    <form>
      <div className="assign-role-area">
        <div className="assign-role-box">
          <input type="radio" name="role" id="seller" />
          <label htmlFor="seller">Seller</label>
        </div>
        <div className="assign-role-box">
          <input type="radio" name="role" id="buyer" />
          <label htmlFor="buyer">Buyer</label>
        </div>
        <div className="assign-role-box">
          <input type="radio" name="role" id="broker" />
          <label htmlFor="broker">Broker</label>
        </div>
      </div>
    </form>
  );
};

export default AssignRole;
