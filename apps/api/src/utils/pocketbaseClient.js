import dotenv from 'dotenv';
dotenv.config();
import Pocketbase from 'pocketbase';
import logger from './logger.js';

const POCKETBASE_HOST = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

async function waitForHealth({ retries = 10, delayMs = 1000 } = {}) {
    for (let i = 1; i <= retries; i++) {
        const response = await fetch(`${POCKETBASE_HOST}/api/health`, { method: 'HEAD' });
        if (response.ok) {
            return;
        }

        logger.warn(`PocketBase not ready, retrying (${i}/${retries})...`);

        await new Promise((r) => setTimeout(r, delayMs));
    }

    throw new Error(`PocketBase health check failed after ${retries} retries`);
}

const pocketbaseClient = new Pocketbase(POCKETBASE_HOST);
console.log("POCKETBASE_HOST =", POCKETBASE_HOST);
console.log("EMAIL =", process.env.PB_SUPERUSER_EMAIL);

(async () => {
  try {
    const auth = await pocketbaseClient
      .collection("_superusers")
      .authWithPassword(
        process.env.PB_SUPERUSER_EMAIL,
        process.env.PB_SUPERUSER_PASSWORD
      );

    console.log("✅ PocketBase Login Success");
    console.log("Authenticated:", pocketbaseClient.authStore.isValid);
    console.log(auth);

  } catch (err) {

    console.log("❌ PocketBase Login Failed");
    console.dir(err, { depth: null });

  }
})();

export default pocketbaseClient;
export { pocketbaseClient };
