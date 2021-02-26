import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { useStreamQueryAsPublic } from "@daml/dabl-react";
import {
  RegisteredExchange,
  RegisteredCustodian,
  RegisteredIssuer,
  RegisteredInvestor,
} from "@daml.js/daml-factoring/lib/Marketplace/Registry";
import {
  RegisteredBroker,
  RegisteredBuyer,
  RegisteredSeller,
} from "@daml.js/daml-factoring/lib/Factoring/Registry";

export type RegistryLookup = {
  exchangeMap: Map<string, RegisteredExchange>;
  custodianMap: Map<string, RegisteredCustodian>;
  issuerMap: Map<string, RegisteredIssuer>;
  brokerMap: Map<string, RegisteredBroker>;
  investorMap: Map<string, RegisteredInvestor>;
  buyerMap: Map<string, RegisteredBuyer>;
  sellerMap: Map<string, RegisteredSeller>;
};

const RegistryLookupContext = createContext<RegistryLookup | undefined>(
  undefined
);
type RegistryLookupProps = {};

export function RegistryLookupProvider({
  children,
}: PropsWithChildren<RegistryLookupProps>) {
  const [registryLookup, setRegistryLookup] = useState<RegistryLookup>({
    exchangeMap: new Map(),
    custodianMap: new Map(),
    issuerMap: new Map(),
    brokerMap: new Map(),
    investorMap: new Map(),
    buyerMap: new Map(),
    sellerMap: new Map(),
  });
  const exchanges = useStreamQueryAsPublic(RegisteredExchange).contracts;
  const custodians = useStreamQueryAsPublic(RegisteredCustodian).contracts;
  const brokers = useStreamQueryAsPublic(RegisteredBroker).contracts;
  const issuers = useStreamQueryAsPublic(RegisteredIssuer).contracts;
  const investors = useStreamQueryAsPublic(RegisteredInvestor).contracts;
  const buyers = useStreamQueryAsPublic(RegisteredBuyer).contracts;
  const sellers = useStreamQueryAsPublic(RegisteredSeller).contracts;

  useEffect(() => {
    const exchangeMap = exchanges.reduce(
      (accum, contract) =>
        accum.set(contract.payload.exchange, contract.payload),
      new Map()
    );
    const custodianMap = custodians.reduce(
      (accum, contract) =>
        accum.set(contract.payload.custodian, contract.payload),
      new Map()
    );
    const brokerMap = brokers.reduce(
      (accum, contract) => accum.set(contract.payload.broker, contract.payload),
      new Map()
    );
    const issuerMap = issuers.reduce(
      (accum, contract) => accum.set(contract.payload.issuer, contract.payload),
      new Map()
    );
    const investorMap = investors.reduce(
      (accum, contract) =>
        accum.set(contract.payload.investor, contract.payload),
      new Map()
    );
    const buyerMap = buyers.reduce(
      (accum, contract) => accum.set(contract.payload.buyer, contract.payload),
      new Map()
    );
    const sellerMap = sellers.reduce(
      (accum, contract) => accum.set(contract.payload.seller, contract.payload),
      new Map()
    );

    setRegistryLookup({
      exchangeMap: exchangeMap,
      custodianMap: custodianMap,
      issuerMap: issuerMap,
      brokerMap: brokerMap,
      investorMap: investorMap,
      buyerMap: buyerMap,
      sellerMap: sellerMap,
    });
  }, [exchanges, custodians, brokers, issuers, investors, buyers, sellers]);

  return React.createElement(
    RegistryLookupContext.Provider,
    { value: registryLookup },
    children
  );
}

export function useRegistryLookup() {
  var registryLookup = React.useContext(RegistryLookupContext);

  if (registryLookup === undefined) {
    throw new Error("useRegistryLookup must be within RegistryLookup Provider");
  }
  return registryLookup;
}

export default RegistryLookupProvider;
