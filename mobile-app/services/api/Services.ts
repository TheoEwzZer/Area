import { useAuth } from "@clerk/clerk-expo";
import { Service } from "@/constants/Types";
import { API_URL } from "@/constants/Data";

export const useServices: () => {
  fetchServices: () => Promise<Service[]>;
} = () => {
  const { getToken } = useAuth();

  const fetchServices: () => Promise<Service[]> = async (): Promise<
    Service[]
  > => {
    const token: string | null = await getToken();
    if (!token) {
      throw new Error("No auth token provided");
    }

    const response = await fetch(`${API_URL}/services`, {
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
    return data;
  };

  return { fetchServices };
};
