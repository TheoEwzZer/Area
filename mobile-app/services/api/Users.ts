import { useAuth } from "@clerk/clerk-expo";
import { Service, User } from "@/constants/Types";
import { API_URL } from "@/constants/Data";

export const useUsers = () => {
  const { getToken } = useAuth();

  const fetchUserServices: (userId: string) => Promise<Service[]> = async (
    userId: string,
  ): Promise<Service[]> => {
    const token: string | null = await getToken();
    if (!token) {
      throw new Error("No auth token provided");
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
      throw new Error(`Request error: ${errorData.message}`);
    }

    const data: Service[] = await response.json();
    return data;
  };

  const fetchUsers: () => Promise<User[]> = async (): Promise<User[]> => {
    const token: string | null = await getToken();
    if (!token) {
      throw new Error("No auth token provided");
    }

    const response = await fetch(`${API_URL}/users`, {
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

    const data: User[] = await response.json();
    return data;
  };

  const deleteUserService: (userId: string, serviceName: string) => Promise<void> = async (
      userId: string,
      serviceName: string
    ): Promise<void> => {
      const token: string | null = await getToken();
      if (!token) {
        throw new Error("No auth token provided");
      }
  
      const response = await fetch(`${API_URL}/users/${userId}/services/${serviceName}`, {
        method: "DELETE",
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
    };

  return { fetchUserServices, fetchUsers, deleteUserService };
};