export type UserRole = "user" | "provider";

import { supabase } from "./supabase";

export const getUserRole = async (): Promise<UserRole> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const type = (user?.user_metadata as { provider_type?: string })?.provider_type;
  return type === "provider" ? "provider" : "user";
};
