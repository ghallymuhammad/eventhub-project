import { BASE_API_URL } from "../../../app.config";
import axios from "axios";

const axiosInstance = axios.create({
	baseURL: BASE_API_URL,
	headers: { "Content-Type": "application/json" },
	withCredentials: true, // Re-enable credentials now that CORS is fixed
});

// Add request interceptor for debugging and auth
axiosInstance.interceptors.request.use(
	(config) => {
		// Add auth token if available
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		return config;
	},
	(error) => {
		console.error('❌ Request interceptor error:', error);
		return Promise.reject(error);
	}
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		console.error('❌ API response error:', {
			status: error.response?.status,
			message: error.response?.data?.message || error.message,
			url: error.config?.url,
		});

		// Handle 401 errors - redirect to login
		if (error.response?.status === 401) {
			console.warn('🔐 Authentication failed - redirecting to login');
			
			// Clear invalid token
			if (typeof window !== 'undefined') {
				localStorage.removeItem('token');
				localStorage.removeItem('user_data');
				document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
				
				// Redirect to login page
				const currentPath = window.location.pathname;
				if (currentPath !== '/login' && currentPath !== '/register') {
					window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname + window.location.search);
				}
			}
		}

		return Promise.reject(error);
	}
);

const axiosAuthInstance = (token: string) =>
	axios.create({
		baseURL: BASE_API_URL,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		withCredentials: true,
	});

export { axiosInstance, axiosAuthInstance };
