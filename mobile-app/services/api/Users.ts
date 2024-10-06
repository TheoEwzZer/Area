import { useAuth } from "@clerk/clerk-expo";
import { Service } from "@/constants/Types";

const API_URL = "https://69d6-2001-861-e3d9-2750-ce1-ab-5bd2-6dea.ngrok-free.app/api";

export const useUsers: () => {
  fetchUserServices: (userId: string) => Promise<Service[]>;
} = () => {
  const { getToken } = useAuth();

  const fetchUserServices: (userId: string) => Promise<Service[]> = async (
    userId: string
  ): Promise<Service[]> => {
    const token: string | null = await getToken();
    if (!token) {
      throw new Error("No auth token");
    }

    const response = await fetch(`${API_URL}/users/${userId}/services`, {
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

    const data: Service[] = await response.json();
    console.log(data);
    return data;
  };

  return { fetchUserServices };
};
