"use client";

import {
  SupabaseClient,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ReactElement, ReactNode, useState } from "react";

import { Database } from "@/database.types";

interface SupabaseProviderProps {
  children: ReactNode;
}

function SupabaseProvider({ children }: SupabaseProviderProps): ReactElement {
  const [supabaseClient] = useState(
    (): SupabaseClient<Database, "public", Database["public"]> =>
      createClientComponentClient<Database>()
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}

export default SupabaseProvider;
