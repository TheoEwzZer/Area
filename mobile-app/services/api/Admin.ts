import { useAuth } from "@clerk/clerk-expo";
import { API_URL } from "@/constants/Data";

export const useAdmin: () => {
  checkAdmin: () => Promise<{ isAdmin: boolean }[]>;
} = () => {
  const { getToken } = useAuth();

  const checkAdmin: () => Promise<{ isAdmin: boolean }[]> = async (): Promise<
    { isAdmin: boolean }[]
  > => {
    const token: string | null = await getToken();
    if (!token) {
      throw new Error("No auth token provided");
    }

    const response = await fetch(`${API_URL}/check-admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        mode: "cors",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Request error: ${errorData.message}`);
    }

    const data: { isAdmin: boolean }[] = await response.json();
    return data;
  };

  return { checkAdmin };
};