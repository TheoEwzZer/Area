"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ReactElement, useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

export function Navbar(): ReactElement | null {
  const pathname: string = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect((): void => {
    const checkAdmin: () => Promise<void> = async (): Promise<void> => {
      const response = await fetch("/api/check-admin");
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    };
  
    checkAdmin();
  }, []);

  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return null;
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6 bg-white">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/create"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <span className="text-2xl font-bold">AREA</span>
        </Link>
        <Link
          href="/my-applets"
          className="text-foreground transition-colors hover:text-foreground"
        >
          My Applets
        </Link>
        <Link
          href="/create"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Create
        </Link>
        {isAdmin && (
          <Link
            href="/admin/users"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        )}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/create"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span className="text-2xl font-bold">AREA</span>
            </Link>
            <Link href="/my-applets" className="hover:text-foreground">
              My Applets
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground"
            >
              Create
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="text-muted-foreground hover:text-foreground"
              >
            Admin
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="ml-4" variant="outline">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

export default Navbar;