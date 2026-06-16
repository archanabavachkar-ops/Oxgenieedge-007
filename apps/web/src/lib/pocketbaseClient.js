import PocketBase from 'pocketbase';

const POCKETBASE_API_URL =
  'https://web-production-d6416a.up.railway.app';

const pocketbaseClient = new PocketBase(POCKETBASE_API_URL);

export default pocketbaseClient;