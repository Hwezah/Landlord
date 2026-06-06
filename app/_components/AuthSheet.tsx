"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Tab = "signin" | "signup";

type RememberedAccount = {
  email: string;
  displayName?: string;
  provider?: "google" | "apple" | "password";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AuthSheet({ open, onOpenChange }: Props) {
  const { signIn, signUp, signInWithProvider } = useAuth();

  const [step, setStep] = useState<"chooser" | Tab>("signin");
  const [rememberedAccounts, setRememberedAccounts] = useState<
    RememberedAccount[]
  >([]);
  const [selectedAccount, setSelectedAccount] =
    useState<RememberedAccount | null>(null);
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getRememberedAccounts = () => {
    if (typeof window === "undefined") return [] as RememberedAccount[];
    try {
      const raw = window.localStorage.getItem("landlord_known_accounts");
      return raw ? (JSON.parse(raw) as RememberedAccount[]) : [];
    } catch {
      return [];
    }
  };

  const saveRememberedAccount = (account: RememberedAccount) => {
    if (typeof window === "undefined") return;
    try {
      const current = getRememberedAccounts();
      const normalized = current.filter((item) => item.email !== account.email);
      const next = [account, ...normalized].slice(0, 5);
      window.localStorage.setItem(
        "landlord_known_accounts",
        JSON.stringify(next),
      );
      setRememberedAccounts(next);
    } catch {
      return;
    }
  };

  const reset = () => {
    setSelectedAccount(null);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setLoading(false);
    setSuccess(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      reset();
    }
    onOpenChange(val);
  };

  useEffect(() => {
    if (!open) return;
    const accounts = getRememberedAccounts();
    setRememberedAccounts(accounts);
    setStep(accounts.length > 0 ? "chooser" : "signin");
    // Reset everything when dialog opens
    reset();
  }, [open]);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (tab === "signup" && !displayName) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    const result =
      tab === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, displayName);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    saveRememberedAccount({
      email,
      displayName:
        tab === "signup" ? displayName : selectedAccount?.displayName,
      provider: "password",
    });

    if (tab === "signup") {
      setSuccess(true);
    } else {
      handleOpenChange(false);
    }
  };

  const handleProvider = async (provider: string) => {
    setError(null);
    setLoading(true);

    // Clear any selected account to force fresh OAuth flow
    setSelectedAccount(null);
    setEmail("");

    // Force account selection by passing true as second parameter
    const result = await signInWithProvider(provider, true);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (!result.error) {
      handleOpenChange(false);
    }
  };

  const handleDifferentAccount = () => {
    // Clear everything
    setSelectedAccount(null);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setTab("signin");
    setStep("signin");
    setError(null);
  };

  const content = (
    <div className="flex flex-col gap-5 px-1 pb-6">
      {step === "chooser" ? (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h2 className="text-2xl font-bold">Choose an account</h2>
            <p className="text-sm text-muted-foreground">
              Pick a remembered account or sign in with a different email.
            </p>
          </div>

          <div className="space-y-3">
            {rememberedAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setTab("signin");
                  setSelectedAccount(account);
                  setStep("signin");
                }}
                className="w-full rounded-3xl border border-border bg-background px-5 py-4 text-left transition hover:border-emerald-400"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {account.displayName
                      ? account.displayName[0].toUpperCase()
                      : account.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {account.displayName ?? account.email.split("@")[0]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {account.email}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-full py-5"
              onClick={handleDifferentAccount}
            >
              Use a different account
            </Button>
            <Button
              variant="secondary"
              className="w-full rounded-full py-5"
              onClick={() => {
                setSelectedAccount(null);
                setEmail("");
                setPassword("");
                setDisplayName("");
                setTab("signup");
                setStep("signup");
              }}
            >
              Create a new account
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex rounded-full bg-muted p-1">
            <button
              onClick={() => {
                setTab("signin");
                setError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("signup");
                setError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {success ? (
            <div className="text-center py-6 flex flex-col gap-2">
              <p className="text-lg font-semibold">Check your email</p>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                Click it to activate your account.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              {tab === "signup" && (
                <Input
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="py-5"
                />
              )}
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-5"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-5"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-5 rounded-full font-semibold"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : tab === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="flex items-center gap-3 my-2">
                <hr className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <hr className="flex-1 border-t border-border" />
              </div>

              <Button
                onClick={() => handleProvider("google")}
                disabled={loading}
                variant="outline"
                className="w-full py-5 rounded-full"
              >
                Continue with Google
              </Button>
              <Button
                onClick={() => handleProvider("apple")}
                disabled={loading}
                variant="outline"
                className="w-full py-5 rounded-full mt-2"
              >
                Continue with Apple
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {tab === "signin" ? (
                  <>
                    No account?{" "}
                    <button
                      onClick={() => setTab("signup")}
                      className="underline text-foreground"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => setTab("signin")}
                      className="underline text-foreground"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[420px] rounded-3xl px-8 py-8">
        <DialogHeader className="mb-4 flex flex-col items-center text-center">
          <DialogTitle className="text-xl font-bold">
            Welcome to Landlord
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
