const API_SERVER_URL =
  `${import.meta.env.VITE_API_BASE_URL}/api`;

console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
console.log("API_SERVER_URL =", API_SERVER_URL);

const apiServerClient = {
  fetch: async (url, options = {}) => {
    console.log("REQUEST =", API_SERVER_URL + url);
    return await window.fetch(API_SERVER_URL + url, options);
  }
};

export default apiServerClient;
export { apiServerClient };