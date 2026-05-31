import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useAuth } from '@/hooks/use-auth';
import { AuthDialog } from '@/components/auth-dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Cloud, CloudLightning, RefreshCw, LogOut, RefreshCcw, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AppHeader() {
  const { user, logout, syncStatus, triggerCloudSync, lastSyncedTime } = useAuth();

  const handleManualSync = () => {
    try {
      const storedSemesters = localStorage.getItem("guruSemesters");
      const storedSelectedSemester = localStorage.getItem("guruSelectedSemester");
      if (storedSemesters) {
        const semesters = JSON.parse(storedSemesters);
        const selectedKey = storedSelectedSemester ? JSON.parse(storedSelectedSemester) : null;
        triggerCloudSync(semesters, selectedKey);
      }
    } catch (e) {
      console.error("Manual sync failed", e);
    }
  };

  const getSyncIndicator = () => {
    switch (syncStatus) {
      case "syncing":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 cursor-pointer">
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Syncing grades with cloud database...</p>
            </TooltipContent>
          </Tooltip>
        );
      case "synced":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-pointer">
                <Cloud className="h-4.5 w-4.5 text-emerald-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>All grades saved to cloud safely</p>
              {lastSyncedTime && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Last synced: {lastSyncedTime.toLocaleTimeString()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      case "error":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center p-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 cursor-pointer">
                <CloudLightning className="h-4.5 w-4.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync error. Grades are saved locally in your browser.</p>
            </TooltipContent>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo.svg"
            alt="Guru App Logo"
            width={28}
            height={28}
            className="text-primary"
          />
          <h1 className="text-xl font-semibold text-foreground">Guru</h1>
        </Link>
        
        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          
          <TooltipProvider delayDuration={200}>
            {user ? (
              <>
                {getSyncIndicator()}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/80 shadow-sm overflow-hidden p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User profile"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {user.email ? user.email.substring(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-xl border border-border/80" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-foreground leading-none">
                          {user.displayName || "Guru Student"}
                        </p>
                        <p className="text-xs text-muted-foreground leading-none truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleManualSync} className="flex items-center cursor-pointer gap-2 py-2 rounded-lg m-1 text-sm font-medium">
                      <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                      Sync Cloud Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 py-2 rounded-lg m-1 text-sm font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <AuthDialog
                trigger={
                  <Button variant="outline" size="sm" className="h-9 rounded-xl border-primary/45 hover:bg-primary/5 hover:text-primary transition-all font-semibold active:scale-97">
                    Sign In
                  </Button>
                }
              />
            )}
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
