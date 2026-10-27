
import axios from "axios";

const aiApi = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

export async function getRecommendations(role, target, userId, limit = 2500) {
  const token = localStorage.getItem("startupsync_token");

  if (!token) {
    throw new Error("Please log in to view recommendations.");
  }

  if (!role || !target || !userId) {
    throw new Error("Role, recommendation target, and user ID are required.");
  }

  const endpoint =
    `/recommendations/${encodeURIComponent(role)}` +
    `/${encodeURIComponent(userId)}` +
    `/${encodeURIComponent(target)}`;

  const response = await aiApi.get(endpoint, {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export default aiApi;