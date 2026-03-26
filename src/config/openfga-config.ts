import { OpenFgaClient } from '@openfga/sdk';

export const fgaClient = new OpenFgaClient({
    apiUrl: process.env.FGA_URL,
    storeId: process.env.FGA_STORE_ID,
});
