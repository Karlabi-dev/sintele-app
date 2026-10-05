import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import telefoneIcon from "../../assets/icons/telefone.png";
import whatsappIcon from "../../assets/icons/whatsapp.png";
import gmailIcon from "../../assets/icons/gmail.png";
import linkedinIcon from "../../assets/icons/linkedin.png";
import instagramIcon from "../../assets/icons/instagram.png";
import githubIcon from "../../assets/icons/github.png";
import youtubeIcon from "../../assets/icons/youtube.png";
import redesIcon from "../../assets/icons/redes.png";
import "./SocialContacts.css";
function SocialContacts({ onBack }) {
    const [contacts, setContacts] = useState({
        whatsapp: {
            value: "",
            isActive: false,
        },
        phone: {
            value: "",
            isActive: false,
        },
        email: {
            value: "",
            isActive: false,
        },
    });
    const [socialLinks, setSocialLinks] = useState({
        linkedin: {
            url: "",
            isActive: false,
        },
        instagram: {
            url: "",
            isActive: false,
        },
        github: {
            url: "",
            isActive: false,
        },
        youtube: {
            url: "",
            isActive: false,
        },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError("");
                const user = auth.currentUser;
                if (!user) {
                    throw new Error(
                        "Usuário não autenticado."
                    );
                }
                const token =
                    await user.getIdToken();
                const response = await fetch(
                    "https://sintele-api.onrender.com/api/social-contacts/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );
                const data =
                    await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Erro ao carregar contatos."
                    );
                }
                setContacts({
                    whatsapp: {
                        value:
                            data.contacts?.whatsapp?.value ||
                            "",
                        isActive:
                            data.contacts?.whatsapp?.isActive ||
                            false,
                    },
                    phone: {
                        value:
                            data.contacts?.phone?.value ||
                            "",
                        isActive:
                            data.contacts?.phone?.isActive ||
                            false,
                    },
                    email: {
                        value:
                            data.contacts?.email?.value ||
                            "",
                        isActive:
                            data.contacts?.email?.isActive ||
                            false,
                    },
                });
                const loadedSocialLinks = {
                    linkedin: {
                        url: "",
                        isActive: false,
                    },
                    instagram: {
                        url: "",
                        isActive: false,
                    },
                    github: {
                        url: "",
                        isActive: false,
                    },
                    youtube: {
                        url: "",
                        isActive: false,
                    },
                };
                data.socialLinks?.forEach(
                    (social) => {
                        if (
                            loadedSocialLinks[
                                social.platform
                            ]
                        ) {
                            loadedSocialLinks[
                                social.platform
                            ] = {
                                url:
                                    social.url || "",
                                isActive:
                                    social.is_active ||
                                    false,
                            };
                        }
                    }
                );
                setSocialLinks(
                    loadedSocialLinks
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar contatos:",
                    error
                );
                setError(
                    error.message ||
                    "Erro ao carregar informações."
                );
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);
    function handleContactChange(
        type,
        value
    ) {
        setContacts((current) => ({
            ...current,
            [type]: {
                ...current[type],
                value,
            },
        }));
    }
    function toggleContact(type) {
        setContacts((current) => ({
            ...current,
            [type]: {
                ...current[type],
                isActive:
                    !current[type].isActive,
            },
        }));
    }
    function handleSocialChange(
        platform,
        value
    ) {
        setSocialLinks((current) => ({
            ...current,
            [platform]: {
                ...current[platform],
                url: value,
            },
        }));
    }
    function toggleSocial(platform) {
        const social =
            socialLinks[platform];
        if (
            !social.isActive &&
            !social.url.trim()
        ) {
            setError(
                "Informe a URL antes de ativar esta rede social."
            );
            return;
        }
        setError("");
        setSocialLinks((current) => ({
            ...current,
            [platform]: {
                ...current[platform],
                isActive:
                    !current[platform].isActive,
            },
        }));
    }
    async function updateContact(
        token,
        type,
        value,
        isActive
    ) {
        const response = await fetch(
            `https://sintele-api.onrender.com/api/social-contacts/me/${type}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${token}`,
                },
                body: JSON.stringify({
                    value:
                        value.trim(),
                    isActive,
                }),
            }
        );
        const data =
            await response.json();
        if (!response.ok) {
            throw new Error(
                data.error ||
                `Erro ao atualizar ${type}.`
            );
        }
        return data;
    }
    async function updateSocial(
        token,
        platform,
        url,
        isActive
    ) {
        const response = await fetch(
            `https://sintele-api.onrender.com/api/social-contacts/me/social/${platform}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${token}`,
                },
                body: JSON.stringify({
                    url:
                        url.trim(),
                    isActive,
                }),
            }
        );
        const data =
            await response.json();
        if (!response.ok) {
            throw new Error(
                data.error ||
                `Erro ao atualizar ${platform}.`
            );
        }
        return data;
    }
    async function handleSave() {
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const user =
                auth.currentUser;
            if (!user) {
                throw new Error(
                    "Usuário não autenticado."
                );
            }
            const token =
                await user.getIdToken();
            await updateContact(
                token,
                "whatsapp",
                contacts.whatsapp.value,
                contacts.whatsapp.isActive
            );
            await updateContact(
                token,
                "phone",
                contacts.phone.value,
                contacts.phone.isActive
            );
            await updateContact(
                token,
                "email",
                contacts.email.value,
                contacts.email.isActive
            );
            for (
                const platform
                of [
                    "linkedin",
                    "instagram",
                    "github",
                    "youtube",
                ]
            ) {
                const social =
                    socialLinks[platform];
                await updateSocial(
                    token,
                    platform,
                    social.url,
                    social.isActive
                );
            }
            setSuccess(
                "Alterações salvas com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao salvar contatos:",
                error
            );
            setError(
                error.message ||
                "Erro ao salvar alterações."
            );
        } finally {
            setSaving(false);
        }
    }
    if (loading) {
        return (
            <div className="social-contacts-page">
                <div className="social-contacts-container">
                    <p>
                        Carregando contatos e redes...
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="social-contacts-page">
            <div className="social-contacts-container">
                <div className="social-contacts-header">
                    <button
                        type="button"
                        className="back-button"
                        onClick={onBack}
                    >
                        ←
                    </button>
                    <div>
                        <h1>
                            Redes e contatos
                        </h1>
                        <p>
                            Gerencie suas formas de contato
                            e redes profissionais.
                        </p>
                    </div>
                </div>
                {error && (
                    <div className="social-message error">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="social-message success">
                        {success}
                    </div>
                )}
                <section className="social-section">
                    <div className="section-title">
                        <span>
                            <img
                                src={telefoneIcon}
                                alt=""
                            />
                        </span>
                        <div>
                            <h2>
                                Contatos
                            </h2>
                            <p>
                                Escolha quais contatos
                                ficarão disponíveis no seu SINTELE.
                            </p>
                        </div>
                    </div>
                    <div className="social-card">
                        <div className="social-card-icon whatsapp-icon">
                            <img
                                src={whatsappIcon}
                                alt=""
                            />
                        </div>
                        <div className="social-card-info">
                            <strong>
                                WhatsApp
                            </strong>
                            <input
                                type="text"
                                value={
                                    contacts.whatsapp.value
                                }
                                onChange={(event) =>
                                    handleContactChange(
                                        "whatsapp",
                                        event.target.value
                                    )
                                }
                                placeholder="Digite seu WhatsApp"
                                className="contact-input"
                            />
                        </div>
                        <button
                            type="button"
                            className={
                                `toggle-button ${
                                    contacts.whatsapp.isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggleContact("whatsapp")
                            }
                            aria-label={
                                contacts.whatsapp.isActive
                                    ? "Desativar WhatsApp"
                                    : "Ativar WhatsApp"
                            }
                        >
                            <span />
                        </button>
                    </div>
                    <div className="social-card">
                        <div className="social-card-icon phone-icon">
                            <img
                                src={telefoneIcon}
                                alt=""
                            />
                        </div>
                        <div className="social-card-info">
                            <strong>
                                Telefone
                            </strong>
                            <input
                                type="text"
                                value={
                                    contacts.phone.value
                                }
                                onChange={(event) =>
                                    handleContactChange(
                                        "phone",
                                        event.target.value
                                    )
                                }
                                placeholder="Digite seu telefone"
                                className="contact-input"
                            />
                        </div>
                        <button
                            type="button"
                            className={
                                `toggle-button ${
                                    contacts.phone.isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggleContact("phone")
                            }
                            aria-label={
                                contacts.phone.isActive
                                    ? "Desativar telefone"
                                    : "Ativar telefone"
                            }
                        >
                            <span />
                        </button>
                    </div>
                    <div className="social-card">
                        <div className="social-card-icon email-icon">
                            <img
                                src={gmailIcon}
                                alt=""
                            />
                        </div>
                        <div className="social-card-info">
                            <strong>
                                E-mail
                            </strong>
                            <span>
                                {contacts.email.value ||
                                    "E-mail não informado"}
                            </span>
                        </div>
                        <button
                            type="button"
                            className={
                                `toggle-button ${
                                    contacts.email.isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggleContact("email")
                            }
                            aria-label={
                                contacts.email.isActive
                                    ? "Desativar e-mail"
                                    : "Ativar e-mail"
                            }
                        >
                            <span />
                        </button>
                    </div>
                </section>
                <section className="social-section">
                    <div className="section-title">
                        <span>
                            <img
                                src={redesIcon}
                                alt=""
                            />
                        </span>
                        <div>
                            <h2>
                                Redes profissionais
                            </h2>
                            <p>
                                Adicione os links das suas
                                principais redes.
                            </p>
                        </div>
                    </div>
                    <div className="social-card social-card-editable">
                        <div className="social-card-icon linkedin-icon">
                            <img
                                src={linkedinIcon}
                                alt=""
                            />
                        </div>
                        <div className="social-card-info">
                            <strong>
                                LinkedIn
                            </strong>
                            <input
                                type="url"
                                value={
                                    socialLinks.linkedin.url
                                }
                                onChange={(event) =>
                                    handleSocialChange(
                                        "linkedin",
                                        event.target.value
                                    )
                                }
                                placeholder="https://linkedin.com/in/seu-perfil"
                                className="social-input"
                            />
                        </div>
                        <button
                            type="button"
                            className={
                                `toggle-button ${
                                    socialLinks.linkedin.isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggleSocial("linkedin")
                            }
                        >
                            <span />
                        </button>
                    </div>
                    <div className="social-card social-card-editable">
                        <div className="social-card-icon instagram-icon">
                            <img
                                src={instagramIcon}
                                alt=""
                            />
                        </div>
                        <div className="social-card-info">
                            <strong>
                                Instagram
                            </strong>
                            <input
                                type="url"
                                value={
                                    socialLinks.instagram.url
                                }
                                onChange={(event) =>
                                    handleSocialChange(
                                        "instagram",
                                        event.target.value
                                    )
                                }
                                placeholder="https://instagram.com/seu-perfil"
                                className="social-input"
                            />
                        </div>
                        <button
                            type="button"
                            className={
                                `toggle-button ${
                                    socialLinks.instagram.isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggleSocial("instagram")
                            }
                        >
                            <span />
                        </button>
                    </div>
                    <div className="social-card social-card-editable">
                        <div className="social-card-icon github-icon">
                            <img
                                src={githubIcon}
                                alt=""
                            />
                        </div>
                        <div className="social-card-info">
                            <strong>
                                GitHub
                            </strong>
                            <input
                                type="url"
                                value={
                                    socialLinks.github.url
                                }
                                onChange={(event) =>
                                    handleSocialChange(
                                        "github",
                                        event.target.value
                                    )
                                }
                                placeholder="https://github.com/seu-usuario"
                                className="social-input"
                            />
                        </div>
                        <button
                            type="button"
                            className={
                                `toggle-button ${
                                    socialLinks.github.isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggleSocial("github")
                            }
                        >
                            <span />
                        </button>
                    </div>
                    <div className="social-card social-card-editable">
                        <div className="social-card-icon youtube-icon">
                            <img
                                src={youtubeIcon}
                                alt=""
                            />
                        </div>
                        <div className="social-card-info">
                            <strong>
                                YouTube
                            </strong>
                            <input
                                type="url"
                                value={
                                    socialLinks.youtube.url
                                }
                                onChange={(event) =>
                                    handleSocialChange(
                                        "youtube",
                                        event.target.value
                                    )
                                }
                                placeholder="https://youtube.com/@seu-canal"
                                className="social-input"
                            />
                        </div>
                        <button
                            type="button"
                            className={
                                `toggle-button ${
                                    socialLinks.youtube.isActive
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                toggleSocial("youtube")
                            }
                        >
                            <span />
                        </button>
                    </div>
                </section>
                <div className="social-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onBack}
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="save-button"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving
                            ? "Salvando..."
                            : "Salvar alterações"}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default SocialContacts;