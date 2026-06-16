const API_SERVER_URL =
  import.meta.env.DEV
    ? "http://localhost:3001/api"
    : "/hcgi/api";

const apiServerClient = {
    fetch: async (url, options = {}) => {
        return await window.fetch(API_SERVER_URL + url, options);
    }
};

export default apiServerClient;

export { apiServerClient };
