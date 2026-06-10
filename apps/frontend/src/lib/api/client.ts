import axios from "axios";

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return "/api";
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10_000,
});
