import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { MeResponse } from "@/types/user";

export function useMe() {
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/api/users/me");
      return res.data;
    },
    retry: false,
  });
}
