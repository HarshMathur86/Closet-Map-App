import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Buffer } from 'buffer';
import { API_BASE_URL } from '../constants/Config';
import { getCurrentUser } from './firebase';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
api.interceptors.request.use(
    async (config) => {
        const user = getCurrentUser();
        if (user) {
            const token = await user.getIdToken();

            // Add these lines temporarily:
            // console.log('--- SWAGGER AUTH INFO ---');
            // console.log('User UID (x-user-id):', user.uid);
            // console.log('ID Token (bearerAuth):', token);
            // console.log('-------------------------');

            config.headers.Authorization = `Bearer ${token}`;
            config.headers['X-User-Id'] = user.uid;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Types
export interface Bag {
    _id: string;
    bagId: string;
    name: string;
    barcodeValue: string;
    createdBy: string;
    createdAt: string;
    clothCount?: number;
}

export interface Cloth {
    _id: string;
    clothId: string;
    name: string;
    imageUrl: string;
    color: string;
    owner?: string;
    category?: string;
    containerBagId: string;
    lastMovedTimestamp: string;
    favorite: boolean;
    notes?: string;
    createdBy: string;
    createdAt: string;
    bagName?: string;
}

export interface FilterOptions {
    colors: string[];
    owners: string[];
    categories: string[];
    bags: { bagId: string; name: string }[];
}

// Bag APIs
export const bagApi = {
    getAll: async (): Promise<Bag[]> => {
        const { data } = await api.get('/bags');
        return data;
    },

    getOne: async (bagId: string): Promise<Bag> => {
        const { data } = await api.get(`/bags/${bagId}`);
        return data;
    },

    create: async (name: string): Promise<Bag> => {
        const { data } = await api.post('/bags', { name });
        return data;
    },

    update: async (bagId: string, name: string): Promise<Bag> => {
        const { data } = await api.put(`/bags/${bagId}`, { name });
        return data;
    },

    delete: async (bagId: string): Promise<void> => {
        await api.delete(`/bags/${bagId}`);
    },
};

// Cloth APIs
export const clothApi = {
    getAll: async (filters?: {
        sortBy?: string;
        sortOrder?: string;
        color?: string;
        owner?: string;
        category?: string;
        bagId?: string;
        favorite?: boolean;
        search?: string;
    }): Promise<Cloth[]> => {
        const { data } = await api.get('/clothes', { params: filters });
        return data;
    },

    getOne: async (clothId: string): Promise<Cloth> => {
        const { data } = await api.get(`/clothes/${clothId}`);
        return data;
    },

    create: async (cloth: {
        name: string;
        imageBase64: string;
        color: string;
        owner?: string;
        category?: string;
        containerBagId: string;
        notes?: string;
    }): Promise<Cloth> => {
        const { data } = await api.post('/clothes', cloth);
        return data;
    },

    update: async (clothId: string, updates: Partial<{
        name: string;
        imageBase64: string;
        color: string;
        owner: string;
        category: string;
        containerBagId: string;
        notes: string;
        favorite: boolean;
    }>): Promise<Cloth> => {
        const { data } = await api.put(`/clothes/${clothId}`, updates);
        return data;
    },

    toggleFavorite: async (clothId: string): Promise<{ favorite: boolean }> => {
        const { data } = await api.patch(`/clothes/${clothId}/favorite`);
        return data;
    },

    delete: async (clothId: string): Promise<void> => {
        await api.delete(`/clothes/${clothId}`);
    },

    getByBarcode: async (barcodeValue: string): Promise<{ bag: Bag; clothes: Cloth[] }> => {
        const { data } = await api.get(`/clothes/scan/${barcodeValue}`);
        return data;
    },

    getFilterOptions: async (): Promise<FilterOptions> => {
        const { data } = await api.get('/clothes/filters/options');
        return data;
    },
};

// Export API
export const exportApi = {
    getBarcodesPdf: async (): Promise<string> => {
        const user = getCurrentUser();
        if (!user) throw new Error('Not authenticated');
        const token = await user.getIdToken();
        return `${API_BASE_URL}/api/export/barcodes?token=${token}&userId=${user.uid}`;
    },

    getBarcodesBase64: async (): Promise<string> => {
        const { data } = await api.get<ArrayBuffer>('/export/barcodes', {
            responseType: 'arraybuffer'
        });
        return Buffer.from(data).toString('base64');
    }
};

export default api;
