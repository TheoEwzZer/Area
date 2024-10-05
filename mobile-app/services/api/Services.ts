import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import { Service} from '@/constants/Types';

const API_URL = 'http://localhost:8080';

export const useServices = () => {
  const { getToken } = useAuth();

  const fetchServices = async (): Promise<Service[]> => {
    try {
      const token = await getToken();
      const response = await axios.get<Service[]>(`${API_URL}/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  };

  return { fetchServices };
};