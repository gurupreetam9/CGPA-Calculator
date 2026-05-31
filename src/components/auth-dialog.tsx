"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle, LogIn } from "lucide-react";

interface AuthDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AuthDialog({ trigger, isOpen, onOpenChange }: AuthDialogProps) {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthError(null);
    setIsSubmitting(false);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const validateForm = () => {
    if (!email || !password) {
      setAuthError("All fields are required.");
      return false;
    }
    if (activeTab === "signup" && password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return false;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return false;
    }
    setAuthError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (activeTab === "signin") {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      handleOpenChange(false);
    } catch (err: any) {
      // Errors are already toasted inside hook, we just display summary in modal
      setAuthError(err.message || "An error occurred during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      handleOpenChange(false);
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in was interrupted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[420px] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold tracking-tight text-center text-foreground flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            Guru Cloud Backup
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Securely save and sync your CGPA and courses across all your devices.
          </DialogDescription>
        </DialogHeader>

        {authError && (
          <Alert variant="destructive" className="py-2.5 px-3 rounded-lg border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-medium leading-none">{authError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as any); setAuthError(null); }} className="w-full mt-4">
          <TabsList className="grid grid-cols-2 w-full bg-muted/50 rounded-xl p-1 border border-border/40">
            <TabsTrigger value="signin" className="rounded-lg text-sm transition-all py-1.5 font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg text-sm transition-all py-1.5 font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Create Account
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <TabsContent value="signin" className="space-y-4 mt-0 focus-visible:outline-none">
              <div className="space-y-2">
                <Label htmlFor="email-signin" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/75" />
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-muted/15 border-border/70 focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-signin" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/75" />
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-muted/15 border-border/70 focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl font-medium transition-all shadow-md active:scale-98 mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-0 focus-visible:outline-none">
              <div className="space-y-2">
                <Label htmlFor="email-signup" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/75" />
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-muted/15 border-border/70 focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-signup" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/75" />
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-muted/15 border-border/70 focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password-signup" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/75" />
                  <Input
                    id="confirm-password-signup"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-muted/15 border-border/70 focus-visible:ring-primary/40 focus-visible:border-primary transition-all text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 rounded-xl font-medium transition-all shadow-md active:scale-98 mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </TabsContent>
          </form>
        </Tabs>

        <div className="relative flex py-3 items-center justify-center">
          <div className="flex-grow border-t border-border/60"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground/80 uppercase font-semibold tracking-wider bg-background px-2">or</span>
          <div className="flex-grow border-t border-border/60"></div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full h-10 rounded-xl border border-border/80 hover:bg-muted/30 transition-all font-medium flex items-center justify-center shadow-sm active:scale-98"
        >
          <svg className="w-4.5 h-4.5 mr-2.5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
