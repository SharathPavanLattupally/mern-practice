
const API_BASE_URL = "http://localhost:5000";

// Find the access token in common storage locations
export function getAccessToken() {
    const keys = ["accessToken", "token"];

    for (const key of keys) {
        const token =
            localStorage.getItem(key) ||
            sessionStorage.getItem(key);

        if (token) return token;
    }

    return null;
}

// Read the role from the JWT payload for UI display.
// The backend remains responsible for enforcing permissions.
export function getCurrentRole() {
    const token = getAccessToken();

    if (!token) return null;

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        return payload.role || null;
    } catch {
        return null;
    }
}

export async function apiRequest(endpoint, options = {}) {
    const token = getAccessToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data;
}
