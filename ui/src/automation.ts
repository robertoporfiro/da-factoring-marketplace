import { getPublicToken } from "./websocket/queryStream";

export const TRIGGER_HASH = process.env.REACT_APP_TRIGGER_HASH;

export enum MarketplaceTrigger {
  ExchangeTrigger = "Factoring.ExchangeTrigger:handleExchange",
  CSDTrigger = "Factoring.CSDTrigger:handleCSD",
  OperatorTrigger = "Factoring.OperatorTrigger:handleOperator",
  BrokerTrigger = "Factoring.BrokerTrigger:handleBroker"
}

export type PublicAutomation = {
  artifactHash: string;
  ledgerId: string;
  automationEntity: {
    tag: string;
    value: {
      packageIds: [string];
      entityName: string;
      metadata: {},
      sdkVersion: string;
      triggerNames: [string];
    }
  }
  deployers: [string];
  createdAt: string;
  owner: string
  apiVersion: string;
}

type PublicAutomationAPIResult = PublicAutomation[] | undefined;

export const getPublicAutomation = async (publicParty?: string): Promise<PublicAutomation[] | undefined> => {
  let automation = undefined;
  if (!publicParty) { return automation }
  await getPublicToken(publicParty)
    .then(token => {
      if (token) {
        const publicHeaders = {
          "Authorization": `Bearer ${token?.toString()}`,
          'Content-Type': 'application/json'
        }
        const url = `/.hub/v1/published`;
        const result: Promise<PublicAutomationAPIResult> = fetch(url, { method: 'GET', headers: publicHeaders})
          .then(response => response.json());
        automation = result;
      }
    });
  return automation;
}

export const deployTrigger = async (artifactHash: string, trigger: MarketplaceTrigger, token: string, publicParty?: string) => {
  await getPublicAutomation(publicParty).then(automations => {
    const artifact = automations?.find(a => a.artifactHash === artifactHash);
    if (artifact) {
      const headers = {
        "Authorization": `Bearer ${token?.toString()}`,
        'Content-Type': 'application/json'
      }
      const deployUrl = `/.hub/v1/published/deploy`;
      fetch(deployUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          artifactHash: artifact.artifactHash,
          owner: artifact.owner,
          name: trigger
        })}).then(response => response.json());
    }
  });
}

export default deployTrigger
