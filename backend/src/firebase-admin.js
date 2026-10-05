const { initializeApp, cert } = require("firebase-admin/app");
const path = require("path");
const serviceAccount = require(
    path.join(__dirname, "../firebase-service-account.json")
);
const adminApp = initializeApp({
    credential: cert(serviceAccount),
});
module.exports = adminApp;