const API_BASE_URL = "http://localhost:8080/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const clubApi = {
  getAll: () => request("/clubs"),

  getById: (id) =>
    request(`/clubs/${encodeURIComponent(id)}`),

  register: (club) =>
    request("/clubs", {
      method: "POST",
      body: JSON.stringify({
        name: club.name,
        category: club.category,
        country: club.country,
        location: club.location,
        institution: club.institution,
        contactEmail: club.email,
        description: club.description,
      }),
    }),

  getByStatus: (status) =>
    request(`/clubs/status/${encodeURIComponent(status)}`),

  approve: (id) =>
    request(`/clubs/${encodeURIComponent(id)}/approve`, {
      method: "PATCH",
    }),

  reject: (id) =>
    request(`/clubs/${encodeURIComponent(id)}/reject`, {
      method: "PATCH",
    }),
};