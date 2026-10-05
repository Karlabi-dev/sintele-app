import { useState } from "react";
import {
    createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "../../firebase";
import eyeIcon from "../../assets/icons/eye.png";
import professionalIcon from "../../assets/icons/professional.png";
import empresaIcon from "../../assets/icons/empresa.png";
import "./Register.css";
function Register({ onLogin, onBack }) {
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
        if (!email.trim()) {
            setError("Digite seu e-mail.");
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
                "https://sintele-api.onrender.com/api/accounts",
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
            setSuccess("Conta criada com sucesso!");
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    }
    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <button
                        type="button"
                        className="back-button"
                        onClick={onBack}
                    >
                        ←
                    </button>
                    <div>
                        <h1>Crie sua conta</h1>
                        <p>
                            Entre para continuar sua identidade
                            profissional e ampliar sua rede
                            de conexões.
                        </p>
                    </div>
                </div>
                <form
                    className="register-form"
                    onSubmit={handleRegister}
                >
                    <div className="input-group">
                        <span className="input-icon">♙</span>
                        <input
                            type="text"
                            placeholder="Nome completo"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(event.target.value)
                            }
                        />
                    </div>
                    <div className="input-group">
                        <span className="input-icon">✉</span>
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                        <span className="password-icon">◉</span>
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Confirmar senha"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                        />
                        <span className="password-icon">◉</span>
                    </div>
                    <div className="profile-type">
                        <p>Tipo de perfil</p>
                        <div className="profile-type-options">
                            <button
                                type="button"
                                className={`profile-type-option ${
                                    type === "professional"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setType("professional")
                                }
                            >
                                <span>
                                    <img
                                        src={professionalIcon}
                                        alt=""
                                    />
                                </span>
                                <span>Profissional</span>
                            </button>
                            <button
                                type="button"
                                className={`profile-type-option ${
                                    type === "company"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setType("company")
                                }
                            >
                                <span>
                                    <img
                                        src={empresaIcon}
                                        alt=""
                                    />
                                </span>
                                <span>Empresa</span>
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="register-success">
                            {success}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="register-button"
                    >
                        Cadastrar
                    </button>
                </form>
                <div className="login-link">
                    Já tem uma conta?{" "}
                    <button
                        type="button"
                        onClick={onLogin}
                    >
                        Entrar
                    </button>
                </div>
            </div>
        </div>
    );
}
export default Register;