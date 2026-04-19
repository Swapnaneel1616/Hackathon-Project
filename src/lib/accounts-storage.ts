/** Demo-only local credential store — do not use in production. */
import type { UserProfile } from "./types";

const ACCOUNTS_KEY = "relief-hub-accounts-v1";

export type StoredAccount = {
  email: string;
  password: string;
  profile: Omit<UserProfile, "email" | "points">;
};

export function loadAccounts(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}

export function saveAccount(account: StoredAccount) {
  const all = loadAccounts();
  all[account.email.toLowerCase()] = {
    ...account,
    email: account.email.toLowerCase(),
  };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(all));
}

export function getAccount(email: string): StoredAccount | undefined {
  return loadAccounts()[email.toLowerCase()];
}
