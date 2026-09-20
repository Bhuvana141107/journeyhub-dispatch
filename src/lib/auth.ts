/**
 * Lightweight demo authentication for RIDE-X.
 *
 * This is a front-end only session layer (suitable for a college demo).
 * It does NOT touch the simulation store — the doubly linked list, the
 * dispatch queue and both hash maps remain the single shared source of truth
 * for the Rider and the Operations experience.
 */

export type AccountRole = "rider" | "ops";

export interface Account {
  /** email for riders, operations id for dispatch staff */
  identifier: string;
  password: string;
  role: AccountRole;
  name: string;
}

export interface Session {
  identifier: string;
  role: AccountRole;
  name: string;
}

const STORAGE_KEY = "ridex-session-v1";
const ACCOUNTS_KEY = "ridex-accounts-v1";

export const DEMO_RIDER = { identifier: "rider@ridex.demo", password: "rider123" };
export const DEMO_OPS = { identifier: "OPS-001", password: "control123" };

const BUILT_IN: Account[] = [
  {
    identifier: DEMO_RIDER.identifier,
    password: DEMO_RIDER.password,
    role: "rider",
    name: "Demo Rider",
  },
  {
    identifier: DEMO_OPS.identifier,
    password: DEMO_OPS.password,
    role: "ops",
    name: "Dispatch Controller",
  },
  { identifier: "OPS-002", password: "control123", role: "ops", name: "Network Operator" },
];

const norm = (v: string) => v.trim().toLowerCase();

class AuthStore {
  session: Session | null = null;
  ready = false;
  /** true right after an explicit logout, so guards return to the landing page */
  justLoggedOut = false;

  private accounts: Account[] = [...BUILT_IN];
  private listeners = new Set<() => void>();
  private version = 0;

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  getVersion = () => this.version;

  private emit() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  /** Reads the persisted session. Safe to call repeatedly. */
  hydrate() {
    if (this.ready || typeof window === "undefined") return;
    this.ready = true;
    try {
      const rawAccounts = localStorage.getItem(ACCOUNTS_KEY);
      if (rawAccounts) {
        const saved: Account[] = JSON.parse(rawAccounts);
        const extra = saved.filter(
          (a) => !BUILT_IN.some((b) => norm(b.identifier) === norm(a.identifier)),
        );
        this.accounts = [...BUILT_IN, ...extra];
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.session = JSON.parse(raw) as Session;
    } catch {
      this.session = null;
    }
    this.emit();
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      if (this.session) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.session));
      else localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(
          this.accounts.filter(
            (a) => !BUILT_IN.some((b) => norm(b.identifier) === norm(a.identifier)),
          ),
        ),
      );
    } catch {
      /* storage unavailable — session stays in memory */
    }
  }

  /**
   * Signs a user in. The account type is resolved internally from the stored
   * account — never chosen on screen.
   */
  login(identifier: string, password: string, expected: AccountRole): Session {
    const id = norm(identifier);
    if (!id || !password) throw new Error("Please fill in both fields.");
    const account = this.accounts.find((a) => norm(a.identifier) === id);
    if (!account || account.password !== password) {
      throw new Error("Those credentials don't match an account.");
    }
    if (account.role !== expected) {
      throw new Error("This account cannot be used here.");
    }
    this.justLoggedOut = false;
    this.session = {
      identifier: account.identifier,
      role: account.role,
      name: account.name,
    };
    this.persist();
    this.emit();
    return this.session;
  }

  /** Creates a rider account (riders only — operations access is issued internally). */
  register(identifier: string, password: string, name?: string): Session {
    const id = norm(identifier);
    if (!id || !password) throw new Error("Please fill in both fields.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    if (this.accounts.some((a) => norm(a.identifier) === id)) {
      throw new Error("An account with that email already exists. Try logging in.");
    }
    const account: Account = {
      identifier: identifier.trim(),
      password,
      role: "rider",
      name: name?.trim() || identifier.split("@")[0]!,
    };
    this.accounts = [...this.accounts, account];
    this.justLoggedOut = false;
    this.session = { identifier: account.identifier, role: "rider", name: account.name };
    this.persist();
    this.emit();
    return this.session;
  }

  logout() {
    this.session = null;
    this.justLoggedOut = true;
    this.persist();
    this.emit();
  }
}

export const auth = new AuthStore();
