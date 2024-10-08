import { useAuth } from "@clerk/clerk-expo";
import { Service } from "@/constants/Types";
import { API_URL } from "@/constants/Data";

export const useAreas: () => {
  fetchAreas: () => Promise<[]>;
} = () => {
  const { getToken } = useAuth();

  const fetchAreas: () => Promise<[]> = async (): Promise<[]> => {
    const token: string | null = await getToken();
    if (!token) {
      throw new Error("No auth token provided");
    }

    const response = await fetch(`${API_URL}/areas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        mode: "cors",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Request error : ${errorData.message}`);
    }

    const data: [] = await response.json();
    return data;
  };

  return { fetchAreas };
};
