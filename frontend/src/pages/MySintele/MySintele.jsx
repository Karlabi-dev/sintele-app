import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { QRCodeCanvas } from "qrcode.react";
import "./MySintele.css";
import editIcon from "../../assets/icons/edit.png";
import professionalIcon from "../../assets/icons/professional.png";
import whatsappIcon from "../../assets/icons/whatsapp.png";
import telefoneIcon from "../../assets/icons/telefone.png";
import gmailIcon from "../../assets/icons/gmail.png";
import compartilharIcon from "../../assets/icons/compartilhar.png";
import qrCodeIcon from "../../assets/icons/qr-code.png";
const PUBLIC_SINTELE_URL =
    "https://sintele-web.vercel.app";
function MySintele({ onBack, onEditProfile }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showQrCode, setShowQrCode] = useState(false);
    useEffect(() => {
        async function loadProfile() {
            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error(
                        "Usuário não autenticado."
                    );
                }
                const token = await user.getIdToken();
                const response = await fetch(
                    "https://sintele-api.onrender.com/api/profiles/professional/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.error ||
                            "Erro ao carregar perfil."
                    );
                }
                setProfile(data.profile);
            } catch (err) {
                console.error(
                    "ERRO AO CARREGAR PERFIL:",
                    err
                );
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);
    function getPublicProfileUrl() {
        const username =
            profile?.username?.trim();
        if (!username) {
            return "";
        }
        return `${PUBLIC_SINTELE_URL}/${encodeURIComponent(
            username
        )}`;
    }
    async function handleShareLink() {
        const profileUrl =
            getPublicProfileUrl();
        if (!profileUrl) {
            alert(
                "Seu perfil ainda não possui um username. Cadastre um username para compartilhar."
            );
            return;
        }
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Meu perfil SINTELE",
                    text: "Conheça meu perfil profissional no SINTELE:",
                    url: profileUrl,
                });
                return;
            }
            await navigator.clipboard.writeText(
                profileUrl
            );
            alert(
                "Link do seu SINTELE copiado!"
            );
        } catch (err) {
            if (err.name === "AbortError") {
                return;
            }
            console.error(
                "ERRO AO COMPARTILHAR:",
                err
            );
            try {
                await navigator.clipboard.writeText(
                    profileUrl
                );
                alert(
                    "Link do seu SINTELE copiado!"
                );
            } catch {
                alert(
                    "Não foi possível compartilhar o link."
                );
            }
        }
    }
    function handleQrCode() {
        const profileUrl =
            getPublicProfileUrl();
        if (!profileUrl) {
            alert(
                "Seu perfil ainda não possui um username. Cadastre um username para gerar o QR Code."
            );
            return;
        }
        setShowQrCode(true);
    }
    if (loading) {
        return (
            <div className="my-sintele-page">
                <div className="my-sintele-container">
                    <div className="my-sintele-loading">
                        <span>S</span>
                        <p>
                            Carregando seu SINTELE...
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="my-sintele-page">
                <div className="my-sintele-container">
                    <header className="my-sintele-header">
                        <button
                            type="button"
                            className="my-sintele-back"
                            onClick={onBack}
                        >
                            ←
                        </button>
                        <h1>
                            Meu SINTELE
                        </h1>
                        <div className="my-sintele-header-space" />
                    </header>
                    <main className="my-sintele-content">
                        <div className="my-sintele-error">
                            <strong>
                                Não foi possível carregar seu perfil.
                            </strong>
                            <p>
                                {error}
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }
    const publicProfileUrl =
        getPublicProfileUrl();
    return (
        <div className="my-sintele-page">
            <div className="my-sintele-container">
                <header className="my-sintele-header">
                    <button
                        type="button"
                        className="my-sintele-back"
                        onClick={onBack}
                    >
                        ←
                    </button>
                    <h1>
                        Meu SINTELE
                    </h1>
                    <button
                        type="button"
                        className="my-sintele-edit"
                        onClick={onEditProfile}
                    >
                        <img
                            src={editIcon}
                            alt=""
                            className="my-sintele-edit-icon"
                        />
                        Editar
                    </button>
                </header>
                <main className="my-sintele-content">
                    <section className="my-sintele-profile-card">
                        <div className="my-sintele-photo-wrapper">
                            {profile?.photo_url ? (
                                <img
                                    src={profile.photo_url}
                                    alt={
                                        profile.full_name ||
                                        "Foto de perfil"
                                    }
                                    className="my-sintele-photo"
                                />
                            ) : (
                                <div className="my-sintele-photo-placeholder">
                                    <img
                                        src={professionalIcon}
                                        alt="Perfil profissional"
                                    />
                                </div>
                            )}
                        </div>
                        <h2>
                            {profile?.full_name ||
                                "Seu nome"}
                        </h2>
                        {profile?.job_title && (
                            <span className="my-sintele-job-title">
                                {profile.job_title}
                            </span>
                        )}
                        {profile?.profession && (
                            <span className="my-sintele-profession">
                                {profile.profession}
                            </span>
                        )}
                        {profile?.company_name && (
                            <span className="my-sintele-company">
                                {profile.company_name}
                            </span>
                        )}
                        {profile?.bio && (
                            <p className="my-sintele-bio">
                                {profile.bio}
                            </p>
                        )}
                        {profile?.city &&
                            profile?.state && (
                                <span className="my-sintele-location">
                                    {profile.city} -{" "}
                                    {profile.state}
                                </span>
                            )}
                    </section>
                    <section className="my-sintele-section">
                        <div className="my-sintele-section-title">
                            <h2>
                                Contatos
                            </h2>
                        </div>
                        <div className="my-sintele-contact-list">
                            {profile?.phone && (
                                <div className="my-sintele-contact-item">
                                    <img
                                        src={whatsappIcon}
                                        alt="WhatsApp"
                                    />
                                    <div>
                                        <strong>
                                            Telefone / WhatsApp
                                        </strong>
                                        <p>
                                            {profile.phone}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {profile?.email && (
                                <div className="my-sintele-contact-item">
                                    <img
                                        src={gmailIcon}
                                        alt="E-mail"
                                    />
                                    <div>
                                        <strong>
                                            E-mail
                                        </strong>
                                        <p>
                                            {profile.email}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {!profile?.phone &&
                                !profile?.email && (
                                    <p className="my-sintele-empty">
                                        Nenhum contato cadastrado.
                                    </p>
                                )}
                        </div>
                    </section>
                    <section className="my-sintele-section">
                        <div className="my-sintele-section-title">
                            <h2>
                                Compartilhar meu SINTELE
                            </h2>
                            <p>
                                Compartilhe seu perfil profissional com
                                outras pessoas.
                            </p>
                        </div>
                        <div className="my-sintele-share-options">
                            <button
                                type="button"
                                className="my-sintele-share-button"
                                onClick={handleShareLink}
                            >
                                <span className="my-sintele-share-icon">
                                    <img
                                        src={compartilharIcon}
                                        alt="Compartilhar"
                                    />
                                </span>
                                <strong>
                                    Link
                                </strong>
                                <small>
                                    Compartilhar
                                </small>
                            </button>
                            <button
                                type="button"
                                className="my-sintele-share-button"
                                onClick={handleQrCode}
                            >
                                <span className="my-sintele-share-icon">
                                    <img
                                        src={qrCodeIcon}
                                        alt="QR Code"
                                    />
                                </span>
                                <strong>
                                    QR Code
                                </strong>
                                <small>
                                    Gerar código
                                </small>
                            </button>
                            <button
                                type="button"
                                className="my-sintele-share-button disabled"
                                disabled
                            >
                                <span className="my-sintele-share-icon">
                                    <img
                                        src={compartilharIcon}
                                        alt="NFC"
                                    />
                                </span>
                                <strong>
                                    NFC
                                </strong>
                                <small>
                                    Em breve
                                </small>
                            </button>
                        </div>
                        {publicProfileUrl && (
                            <div className="my-sintele-public-link">
                                <span>
                                    Seu link público
                                </span>
                                <button
                                    type="button"
                                    onClick={
                                        handleShareLink
                                    }
                                >
                                    {publicProfileUrl}
                                </button>
                            </div>
                        )}
                    </section>
                </main>
                {showQrCode && (
                    <div
                        className="my-sintele-qr-overlay"
                        onClick={() =>
                            setShowQrCode(false)
                        }
                    >
                        <div
                            className="my-sintele-qr-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <button
                                type="button"
                                className="my-sintele-qr-close"
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
                                Aponte a câmera do celular para
                                acessar meu perfil profissional.
                            </p>
                            <div className="my-sintele-qr">
                                <QRCodeCanvas
                                    value={
                                        publicProfileUrl
                                    }
                                    size={220}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <span className="my-sintele-qr-url">
                                {publicProfileUrl}
                            </span>
                            <button
                                type="button"
                                className="my-sintele-qr-share"
                                onClick={
                                    handleShareLink
                                }
                            >
                                <img
                                    src={compartilharIcon}
                                    alt=""
                                />
                                Compartilhar link
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default MySintele;