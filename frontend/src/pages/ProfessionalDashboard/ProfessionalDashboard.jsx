import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { QRCodeCanvas } from "qrcode.react";
import eyeIcon from "../../assets/icons/eye.png";
import compartilharIcon from "../../assets/icons/compartilhar.png";
import qrCodeIcon from "../../assets/icons/qr-code.png";
import projetoIcon from "../../assets/icons/projeto.png";
import meuSinteleIcon from "../../assets/icons/meu_sintele.png";
import redesIcon from "../../assets/icons/redes.png";
import "./ProfessionalDashboard.css";
function ProfessionalDashboard({
    account,
    onLogout,
    onEditProfile,
    onMeuSintele,
    onSocialContacts,
    onProjects,
}) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showQrCode, setShowQrCode] = useState(false);
    useEffect(() => {
        async function loadProfile() {
            try {
                const user = auth.currentUser;
                if (!user) {
                    setError("Usuário não autenticado.");
                    return;
                }
                const token = await user.getIdToken();
                const response = await fetch(
                    "http://localhost:3000/api/profiles/professional/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.error || "Erro ao buscar perfil."
                    );
                }
                setProfile(data.profile);
            } catch (error) {
                console.error(
                    "ERRO AO BUSCAR PERFIL:",
                    error
                );
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);
    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-logo">S</div>
                <p>Carregando...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="dashboard-error">
                <h1>Erro</h1>
                <p>{error}</p>
                <button onClick={onLogout}>
                    Sair
                </button>
            </div>
        );
    }
    const views = 0;
    const shares = 0;
    const connections = 0;
    const profileCompletion = 85;
    const profileUrl = profile?.username
        ? `https://karlabi-dev.github.io/sintele-web/${encodeURIComponent(profile.username)}`
        : "";
    const handleShareProfile = async () => {
        if (!profile?.username) {
            alert(
                "Seu perfil ainda não possui um nome de usuário."
            );
            return;
        }
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Perfil de ${profile.full_name}`,
                    text: `Confira o perfil de ${profile.full_name} no SINTELE.`,
                    url: profileUrl,
                });
            } else {
                await navigator.clipboard.writeText(profileUrl);
                alert("Link do perfil copiado!");
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                try {
                    await navigator.clipboard.writeText(
                        profileUrl
                    );
                    alert("Link do perfil copiado!");
                } catch {
                    alert(
                        "Não foi possível compartilhar o perfil."
                    );
                }
            }
        }
    };
    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <div className="dashboard-brand">
                        <span className="brand-icon">
                            S
                        </span>
                        <span className="brand-name">
                            SINTELE
                        </span>
                    </div>
                    <button
                        className="notification-button"
                        type="button"
                    >
                        ♧
                    </button>
                </header>
                <main className="dashboard-content">
                    <section className="welcome-section">
                        <h1>
                            Olá, {profile.full_name?.split(" ")[0]}! 👋
                        </h1>
                        <p>
                            Aqui está o seu resumo de hoje.
                        </p>
                    </section>
                    <section className="stats-card">
                        <div className="stat-item">
                            <span className="stat-icon">
                                <img
                                    src={eyeIcon}
                                    alt="Visualizações"
                                />
                            </span>
                            <strong>
                                {views}
                            </strong>
                            <small>
                                Visualizações
                            </small>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-icon">
                                <img
                                    src={compartilharIcon}
                                    alt="Compartilhamentos"
                                />
                            </span>
                            <strong>
                                {shares}
                            </strong>
                            <small>
                                Compartilhamentos
                            </small>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-icon"></span>
                            <strong>
                                {connections}
                            </strong>
                            <small>
                                Conexões
                            </small>
                        </div>
                    </section>
                    <section className="completion-card">
                        <div className="completion-icon">
                            ✓
                        </div>
                        <div className="completion-content">
                            <h3>
                                Seu perfil está completo
                            </h3>
                            <p>
                                Aumente suas chances de conexão
                                com 100% do perfil preenchido.
                            </p>
                            <div className="progress-area">
                                <div className="progress-bar">
                                    <div
                                        className="progress-value"
                                        style={{
                                            width: `${profileCompletion}%`,
                                        }}
                                    ></div>
                                </div>
                                <span>
                                    {profileCompletion}%
                                </span>
                            </div>
                        </div>
                    </section>
                    <section className="quick-actions">
                        <h2>
                            Ações rápidas
                        </h2>
                        <div className="quick-actions-grid">
                            <button
                                type="button"
                                className="quick-action"
                                onClick={handleShareProfile}
                            >
                                <span className="quick-action-icon">
                                    <img
                                        src={compartilharIcon}
                                        alt="Compartilhar"
                                    />
                                </span>
                                <span>
                                    Compartilhar
                                    <br />
                                    perfil
                                </span>
                            </button>
                            <button
                                type="button"
                                className="quick-action"
                                onClick={() =>
                                    setShowQrCode(true)
                                }
                            >
                                <span className="quick-action-icon">
                                    <img
                                        src={qrCodeIcon}
                                        alt="QR Code"
                                    />
                                </span>
                                <span>
                                    QR Code
                                </span>
                            </button>
                            <button
                                type="button"
                                className="quick-action"
                                onClick={onProjects}
                            >
                                <span className="quick-action-icon">
                                    <img
                                        src={projetoIcon}
                                        alt="Projetos"
                                    />
                                </span>
                                <span>
                                    Meus
                                    <br />
                                    projetos
                                </span>
                            </button>
                        </div>
                    </section>
                </main>
                <nav className="bottom-navigation">
                    <button
                        className="navigation-item active"
                        type="button"
                    >
                        <span>⌂</span>
                        <small>Início</small>
                    </button>
                    <button
                        className="navigation-item"
                        type="button"
                        onClick={onMeuSintele}
                    >
                        <span>
                            <img
                                src={meuSinteleIcon}
                                alt="Meu SINTELE"
                            />
                        </span>
                        <small>
                            Meu SINTELE
                        </small>
                    </button>
                    <button
                        className="navigation-item"
                        type="button"
                        onClick={onSocialContacts}
                    >
                        <span>
                            <img
                                src={redesIcon}
                                alt="Redes"
                            />
                        </span>
                        <small>
                            Redes
                        </small>
                    </button>
                    <button
                        className="navigation-item"
                        type="button"
                        onClick={onProjects}
                    >
                        <span>
                            <img
                                src={projetoIcon}
                                alt="Projetos"
                            />
                        </span>
                        <small>
                            Projetos
                        </small>
                    </button>
                    <button
                        className="navigation-item"
                        type="button"
                        onClick={() => {
                            const confirmed = window.confirm(
                                "Deseja realmente sair do SINTELE?"
                            );
                            if (confirmed) {
                                onLogout();
                            }
                        }}
                    >
                        <span>↪</span>
                        <small>
                            Sair
                        </small>
                    </button>
                </nav>
                {showQrCode && (
                    <div
                        className="qr-modal-overlay"
                        onClick={() =>
                            setShowQrCode(false)
                        }
                    >
                        <div
                            className="qr-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <button
                                type="button"
                                className="qr-modal-close"
                                onClick={() =>
                                    setShowQrCode(false)
                                }
                            >
                                ×
                            </button>
                            <h2>
                                Meu QR Code
                            </h2>
                            <p>
                                Escaneie para acessar meu perfil
                                no SINTELE.
                            </p>
                            <div className="qr-code-container">
                                <QRCodeCanvas
                                    value={profileUrl}
                                    size={220}
                                    level="H"
                                />
                            </div>
                            <span className="qr-profile-url">
                                {profileUrl}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default ProfessionalDashboard;