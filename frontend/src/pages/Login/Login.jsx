import { useState } from "react";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../../firebase";
import "./Login.css";
function Login({
    onBack,
    onRegister,
    onLoginSuccess
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    async function handleLogin(event) {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (!email.trim() || !password) {
            setError("Preencha seu e-mail e sua senha.");
            return;
        }
        setLoading(true);
        try {
            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email.trim(),
                    password
                );
            const user = userCredential.user;
            const token = await user.getIdToken();
            const response = await fetch(
                "https://sintele-api.onrender.com/api/accounts/me",
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
            console.error("ERRO AO FAZER LOGIN:", error);
            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                setError("E-mail ou senha incorretos.");
            } else if (
                error.code === "auth/invalid-email"
            ) {
                setError("Digite um e-mail válido.");
            } else if (
                error.code === "auth/too-many-requests"
            ) {
                setError(
                    "Muitas tentativas. Aguarde alguns minutos e tente novamente."
                );
            } else {
                setError(
                    error.message ||
                    "Não foi possível entrar. Tente novamente."
                );
            }
        } finally {
            setLoading(false);
        }
    }
    async function handlePasswordReset() {
        setError("");
        setSuccess("");
        if (!email.trim()) {
            setError(
                "Digite seu e-mail para receber o link de recuperação."
            );
            return;
        }
        setResettingPassword(true);
        try {
            await sendPasswordResetEmail(
                auth,
                email.trim()
            );
            setSuccess(
                "Enviamos um link de recuperação para seu e-mail. Verifique sua caixa de entrada."
            );
        } catch (error) {
            console.error(
                "ERRO AO RECUPERAR SENHA:",
                error
            );
            if (
                error.code === "auth/invalid-email"
            ) {
                setError("Digite um e-mail válido.");
            } else if (
                error.code === "auth/user-not-found"
            ) {
                setError(
                    "Não encontramos uma conta com esse e-mail."
                );
            } else {
                setError(
                    "Não foi possível enviar o e-mail de recuperação. Tente novamente."
                );
            }
        } finally {
            setResettingPassword(false);
        }
    }
    return (
        <main className="login-page">
            <div className="login-background"></div>
            <section className="login-container">
                <div className="login-brand">
                    <div className="login-logo">
                        S
                    </div>
                    <h1>SINTELE</h1>
                    <p>
                        Sua identidade profissional,
                        conectada ao seu futuro.
                    </p>
                </div>
                <div className="login-card">
                    <div className="login-header">
                        <h2>Bem-vindo de volta</h2>
                        <p>
                            Entre na sua conta para continuar.
                        </p>
                    </div>
                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >
                        <div className="login-field">
                            <label htmlFor="login-email">
                                E-mail
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                            />
                        </div>
                        <div className="login-field">
                            <div className="login-password-label">
                                <label htmlFor="login-password">
                                    Senha
                                </label>
                                <button
                                    type="button"
                                    className="login-forgot-button"
                                    onClick={handlePasswordReset}
                                    disabled={resettingPassword}
                                >
                                    {resettingPassword
                                        ? "Enviando..."
                                        : "Esqueci minha senha"}
                                </button>
                            </div>
                            <div className="login-password-wrapper">
                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="login-show-password"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Ocultar senha"
                                            : "Mostrar senha"
                                    }
                                >
                                    {showPassword ? "◉" : "◌"}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div className="login-message login-error">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="login-message login-success">
                                {success}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Entrando..."
                                : "Entrar"}
                        </button>
                    </form>
                    <div className="login-divider">
                        <span>ou</span>
                    </div>
                    <div className="login-register">
                        <span>
                            Ainda não tem uma conta?
                        </span>
                        <button
                            type="button"
                            onClick={onRegister}
                        >
                            Criar conta
                        </button>
                    </div>
                </div>
                <p className="login-footer">
                    © {new Date().getFullYear()} SINTELE.
                    Todos os direitos reservados.
                </p>
            </section>
        </main>
    );
}
export default Login;