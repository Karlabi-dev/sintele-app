import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDgOC4ng6X2zdUn3e4TY8s9CsRRhhsVVLc",
    authDomain: "sintele-tech.firebaseapp.com",
    databaseURL: "https://sintele-tech-default-rtdb.firebaseio.com",
    projectId: "sintele-tech",
    storageBucket: "sintele-tech.firebasestorage.app",
    messagingSenderId: "592273613215",
    appId: "1:592273613215:web:e0e1c26f4f9f86eeaf9daa",
    measurementId: "G-ZX1526G3LC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);