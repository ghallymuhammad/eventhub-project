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
			console.log('🔍 Checking token in request interceptor:', token ? 'Token exists' : 'No token');
			
			if (token) {
				try {
					// Basic token format validation (should have 3 parts separated by dots)
					const tokenParts = token.split('.');
					if (tokenParts.length !== 3) {
						console.warn('🔐 Invalid token format, clearing storage');
						localStorage.removeItem('token');
						localStorage.removeItem('user_data');
						document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
						return config; // Continue without token
					}
					
					// Try to parse the payload to check expiration
					try {
						const tokenPayload = JSON.parse(atob(tokenParts[1]));
						const currentTime = Math.floor(Date.now() / 1000);
						
						console.log('🕐 Token expiration check:', {
							currentTime,
							tokenExp: tokenPayload.exp,
							isExpired: tokenPayload.exp && tokenPayload.exp < currentTime
						});
						
						if (tokenPayload.exp && tokenPayload.exp < currentTime) {
							console.warn('🔐 Token expired, clearing storage');
							localStorage.removeItem('token');
							localStorage.removeItem('user_data');
							document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
							
							// Redirect to login if not already there
							if (window.location.pathname !== '/login') {
								window.location.href = '/login?returnUrl=' + encodeURIComponent(window.location.pathname + window.location.search);
							}
							return Promise.reject(new Error('Token expired'));
						}
					} catch (payloadError) {
						console.warn('🔐 Could not parse token payload, but using token anyway:', payloadError.message);
						// Continue with token even if we can't parse the payload
					}
					
					config.headers.Authorization = `Bearer ${token}`;
					console.log('✅ Token added to request headers');
					
				} catch (error) {
					console.error('🔐 Error processing token, clearing storage:', error);
					localStorage.removeItem('token');
					localStorage.removeItem('user_data');
					document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
				}
			} else {
				console.log('❌ No token found in localStorage');
			}
		}

		console.log('🚀 Making API request:', {
			method: config.method?.toUpperCase(),
			url: config.url,
			baseURL: config.baseURL,
			fullURL: `${config.baseURL}${config.url}`,
			hasAuthHeader: !!config.headers.Authorization,
			data: config.data,
		});
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
		console.log('✅ API response received:', {
			status: response.status,
			statusText: response.statusText,
			data: response.data,
			url: response.config.url,
		});
		return response;
	},
	(error) => {
		console.error('❌ API response error:', {
			message: error.message,
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			url: error.config?.url,
			fullURL: `${error.config?.baseURL}${error.config?.url}`,
		});

		// Handle 401 errors - redirect to login
		if (error.response?.status === 401) {
			console.warn('🔐 Authentication failed - redirecting to login');
			
			// Clear invalid token
			if (typeof window !== 'undefined') {
				localStorage.removeItem('token');
				localStorage.removeItem('user_data');
				document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
			}
			
			// Redirect to login page
			if (typeof window !== 'undefined') {
				const currentPath = window.location.pathname;
				if (currentPath !== '/login' && currentPath !== '/register') {
					window.location.href = '/login';
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
