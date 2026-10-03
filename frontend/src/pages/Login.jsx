import { useState } from "react";
import {
    signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../firebase";

function Login({ onBack, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            const token = await user.getIdToken();

            const response = await fetch(
                "http://localhost:3000/api/accounts/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erro ao buscar conta."
                );
            }

            console.log("Conta:", data);

            onLoginSuccess(data.account);

        } catch (error) {
            console.error(error);

            setError(
                "E-mail ou senha incorretos."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Entrar</h1>

            <button type="button" onClick={onBack}>
                Voltar
            </button>

            <form onSubmit={handleLogin}>

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

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>

            </form>

            {error && <p>{error}</p>}
        </div>
    );
}

export default Login;