const { initializeApp, cert } = require("firebase-admin/app");
const fs = require("fs");
const path = require("path");
let serviceAccount;
if (process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:
            process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url:
            process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    };
} else {
    const serviceAccountPath = path.join(
        __dirname,
        "../firebase-service-account.json"
    );
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(
            "Credenciais do Firebase Admin não encontradas."
        );
    }
    serviceAccount = require(serviceAccountPath);
}
const adminApp = initializeApp({
    credential: cert(serviceAccount),
});
module.exports = adminApp;