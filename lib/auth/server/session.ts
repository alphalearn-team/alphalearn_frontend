import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getServerSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
});
