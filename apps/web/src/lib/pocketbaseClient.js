import PocketBase from "pocketbase";

const PB_URL =
  import.meta.env.VITE_POCKETBASE_URL ||
  "https://web-production-d6416a.up.railway.app";

console.log("PocketBase URL =", PB_URL);

const pb = new PocketBase(PB_URL);

// Log every PocketBase request
pb.beforeSend = function (url, options) {
  console.log("PocketBase Request:", url);
  return { url, options };
};

export default pb;