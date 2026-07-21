import PocketBase from "pocketbase";

const pb = new PocketBase(
    import.meta.env.VITE_POCKETBASE_URL ||
    "https://web-production-d6416a.up.railway.app"
);

export default pb;