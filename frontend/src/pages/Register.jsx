import { useState } from "react";
import {
    createUserWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../firebase";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleRegister(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        try {
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            const token = await user.getIdToken();

            const response = await fetch(
                "http://localhost:3000/api/accounts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erro ao criar conta na API."
                );
            }

            console.log("Resposta da API:", data);

            setSuccess(
                "Conta criada e conectada à API com sucesso!"
            );

        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    }

    return (
        <div>
            <h1>Criar conta</h1>

            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                />

                <button type="submit">
                    Criar conta
                </button>
            </form>

            {success && <p>{success}</p>}
            {error && <p>{error}</p>}
        </div>
    );
}

export default Register;