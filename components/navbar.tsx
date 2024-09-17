import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ReactElement } from "react";

export function Navbar(): ReactElement {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-white border-b">
      <Link className="flex items-center justify-center" href="#">
        <span className="text-2xl font-bold">AREA</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
          Home
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
          My Applets
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4 mr:4" href="#">
          Create
        </Link>
        <ClerkProvider>
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
        </ClerkProvider>
      </nav>
    </header>
  );
};

export default Navbar;