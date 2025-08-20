export type UserRole = "user" | "provider";

import { supabase } from "./supabase";

export const getUserRole = async (userId: string): Promise<UserRole> => {
  const { data } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return data ? "provider" : "user";
};
