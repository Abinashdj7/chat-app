import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { authApi } from "../services/api";

export function useUserSearch() {
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const searchUsers = async (query: string) => {
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await authApi.searchUsers(query);
      setSearchResult(data);
    } catch {
      toast({
        title: "Error searching users",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return { searchResult, loading, searchUsers };
}
