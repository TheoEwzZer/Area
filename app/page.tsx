"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";

const services = [
  { name: "Discord", color: "#788CFF", image: "/discord.svg" },
  { name: "Gmail", color: "#EA4335", image: "/gmail.svg" },
  { name: "Spotify", color: "#1DB954", image: "/spotify.svg" },
  { name: "Twitch", color: "#9146FF", image: "/twitch.svg" },
  { name: "Google Calendar", color: "#4285F4", image: "/calendar.svg" },
  { name: "Youtube", color: "#D00000", image: "/youtube.svg" },
  { name: "Deezer", color: "#00C7F2", image: "/deezer.svg" },
  { name: "OneDrive", color: "#0078D4", image: "/onedrive.svg" },
  { name: "Google Drive", color: "#F5E592", image: "/google-drive.svg" },
  { name: "Outlook", color: "#0078D4", image: "/outlook.svg" },
  { name: "Teams", color: "#6264A7", image: "/teams.svg" },
  { name: "Weather", color: "#00A5E5", image: "/weather.svg" },
  { name: "Google Translate", color: "#374255", image: "/google-translate.svg" },
  { name: "Amazon", color: "#FF9900", image: "/amazon.svg" },
];

export default function HomePage() {
  const [filter, setFilter] = useState("");

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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
      <main className="flex-1 py-12 px-4 max-w-5xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Select your favorite services</h1>
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter services"
              className="pl-8 bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <Button
              key={service.name}
              className="h-16 text-white justify-center items-center px-4 rounded-md"
              style={{ backgroundColor: service.color }}
            >
              <Image
                src={service.image}
                alt={service.name}
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="bold">{service.name}</span>
            </Button>
          ))}
        </div>
      </main>
      <footer className="py-6 text-center bg-white border-t">
        <p className="text-sm text-gray-500">© 2023 AREA. All rights reserved.</p>
      </footer>
    </div>
  );
}
