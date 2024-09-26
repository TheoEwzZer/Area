"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactElement, useEffect, useState } from "react";

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
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Link
        href="/create"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <span className="text-2xl font-bold">AREA</span>
      </Link>
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
        <SheetContent
          side="left"
          className="bg-white"
        >
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/create"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span className="text-2xl font-bold">AREA</span>
            </Link>
            <Link
              href="/my-areas"
              className="hover:text-foreground"
            >
              My Areas
            </Link>
            <Link
              href="/my-services"
              className="text-muted-foreground hover:text-foreground"
            >
              My Services
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
      <div className="ml-auto flex items-center gap-4">
        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link
            href="/my-areas"
            className="whitespace-nowrap text-foreground transition-colors hover:text-foreground"
          >
            My Areas
          </Link>
          <Link
            href="/my-services"
            className="whitespace-nowrap text-foreground transition-colors hover:text-foreground"
          >
            My Services
          </Link>
          <Link
            href="/create"
            className="whitespace-nowrap text-foreground transition-colors hover:text-foreground"
          >
            Create
          </Link>
          {isAdmin && (
            <Link
              href="/admin/users"
              className="whitespace-nowrap text-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              className="ml-4"
              variant="outline"
            >
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
