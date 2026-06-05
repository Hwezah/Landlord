"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/app/providers/auth-provider";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Tab = "signin" | "signup";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AuthSheet({ open, onOpenChange }: Props) {
  const isMobile = useIsMobile();
  const { signIn, signUp } = useAuth();

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setLoading(false);
    setSuccess(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

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

    if (tab === "signup") {
      // Supabase sends a confirmation email by default
      setSuccess(true);
    } else {
      handleOpenChange(false);
    }
  };

  const content = (
    <div className="flex flex-col gap-5 px-1 pb-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-full p-1">
        {(["signin", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {success ? (
        <div className="text-center py-6 flex flex-col gap-2">
          <p className="text-lg font-semibold">Check your email</p>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="text-foreground font-medium">{email}</span>. Click
            it to activate your account.
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
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl px-6 pt-6"
          style={{ maxHeight: "85vh" }}
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-bold">
              Welcome to Landlord
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[420px] rounded-3xl px-8 py-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">
            Welcome to Landlord
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
