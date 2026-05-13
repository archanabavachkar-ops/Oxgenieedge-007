import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL =
  'https://web-production-d6416a.up.railway.app';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };