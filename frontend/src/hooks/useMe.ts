import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { MeResponse } from "@/types/user";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<MeResponse>("/api/users/me");
      return data;
    },
    retry: false,
  });
}
