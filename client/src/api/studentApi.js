
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token")
  );
}

async function request(endpoint, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured. Check client/.env.");
  }

  const token = getAccessToken();

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check that your backend is running."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed with status ${response.status}.`
    );
  }

  return result;
}

export const studentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        query.set(key, String(value));
      }
    });

    return request(`/students?${query.toString()}`);
  },

  getById: (id) =>
    request(`/students/${encodeURIComponent(id)}`),

  create: (student) =>
    request("/students", {
      method: "POST",
      body: JSON.stringify(student),
    }),

  update: (id, student) =>
    request(`/students/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(student),
    }),

  remove: (id) =>
    request(`/students/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

export const dashboardApi = {
  getStats: (period = "7") =>
    request(`/dashboard?period=${encodeURIComponent(period)}`),
};