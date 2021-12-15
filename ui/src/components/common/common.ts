import { useState, useEffect, useMemo } from 'react'

import { isRunningOnHub, PartyToken, useAdminParty, usePublicParty as useHubPublicParty } from '@daml/hub-react';
import { deploymentMode, DeploymentMode } from '../../config'

export const expiredToken = (token: string) => {
    if (isRunningOnHub()) {
        return (new PartyToken(token)).isExpired
    } else {
        return false
    }
}

function cache(options?: { permanent: boolean }) {
  const store = options?.permanent ? localStorage : sessionStorage;

  return {
    save: (key: string, value: string) => store.setItem(key, value),
    remove: (key: string) => store.removeItem(key),
    load: (key: string) => store.getItem(key),
  };
}

const PUBLIC_PARTY_ID_KEY = 'default_parties/public_party_id';

export function usePublicParty(): string | undefined {
  // Cache in localStorage to share across all tabs & restarts
  const { save, load } = useMemo(() => cache({ permanent: true }), []);

  const [publicParty, setPublicParty] = useState<string>(undefined);
  const hubPublicParty = useHubPublicParty();

  useEffect(() => {
    const cachedPublicParty = load(PUBLIC_PARTY_ID_KEY);
    if (cachedPublicParty) {
      setPublicParty(cachedPublicParty);
    }
  }, [load]);

  useEffect(() => {
    if (deploymentMode === DeploymentMode.DEV) {
      setPublicParty('Public');
    } else {
      if (!publicParty && hubPublicParty) {
        save(PUBLIC_PARTY_ID_KEY, hubPublicParty);
        setPublicParty(hubPublicParty);
      }
    }
  }, [publicParty, hubPublicParty, save]);

  return publicParty;
}

const USER_ADMIN_PARTY_ID_KEY = 'default_parties/user_admin_party_id';

export function useOperatorParty() {
  // Cache in localStorage to share across all tabs & restarts
  const { save, load } = useMemo(() => cache({ permanent: true }), []);

  const [operator, setOperator] = useState<string>();
  const hubAdminParty = useAdminParty();

  useEffect(() => {
    const cachedUserAdmin = load(USER_ADMIN_PARTY_ID_KEY);
    if (cachedUserAdmin) {
      setOperator(cachedUserAdmin);
    }
  }, [load]);

  useEffect(() => {
    if (deploymentMode === DeploymentMode.DEV) {
      setOperator('Operator');
    } else {
      if (!operator && hubAdminParty) {
        save(USER_ADMIN_PARTY_ID_KEY, hubAdminParty);
        setOperator(hubAdminParty);
      }
    }
  }, [operator, hubAdminParty, save]);

  return operator;
}
