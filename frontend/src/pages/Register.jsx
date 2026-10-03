import { useState } from "react";
import {
    createUserWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../firebase";

function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [type, setType] = useState("professional");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleRegister(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!fullName.trim()) {
            setError("Digite seu nome completo.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

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
                    body: JSON.stringify({
                        fullName: fullName.trim(),
                        type: type,
                    }),
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
                    type="text"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(event) =>
                        setFullName(event.target.value)
                    }
                />

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

                <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(event) =>
                        setConfirmPassword(event.target.value)
                    }
                />

                <div>
                    <p>Tipo de conta:</p>

                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="professional"
                            checked={type === "professional"}
                            onChange={(event) =>
                                setType(event.target.value)
                            }
                        />
                        Profissional
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="company"
                            checked={type === "company"}
                            onChange={(event) =>
                                setType(event.target.value)
                            }
                        />
                        Empresa
                    </label>
                </div>

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