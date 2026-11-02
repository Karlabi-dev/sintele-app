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

const PUBLIC_SINTELE_URL = "https://sintele-web.vercel.app";

function Icon({ name, size = 18 }) {
  const paths = {
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    folder: (
      <>
        <path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M3 9h18" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="5" cy="18" r="2.5" />
        <circle cx="19" cy="18" r="2.5" />
        <path d="m10.7 7.2-4.4 8.6M13.3 7.2l4.4 8.6M7.5 18h9" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2" />
      </>
    ),
    qr: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM19 14v2M14 19h2M18 18h3v3h-3z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.user}
    </svg>
  );
}

function getInitials(name) {
  const parts = (name || "SINTELE").trim().split(" ").filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "S"
  );
}

function ProfileAvatar({ profile, className = "" }) {
  return (
    <span className={"profile-avatar " + className} aria-hidden="true">
      <span className="profile-avatar-fallback">
        {getInitials(profile?.full_name)}
      </span>
      {profile?.photo_url && (
        <img
          src={profile.photo_url}
          alt=""
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}

function ProfessionalDashboard({
  account,
  onLogout,
  onMeuSintele,
  onSocialContacts,
  onProjects,
  onDiscoverProfessionals,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
          "https://sintele-api.onrender.com/api/profiles/professional/me",
          { headers: { Authorization: "Bearer " + token } },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erro ao buscar perfil.");
        }
        setProfile(data.profile);
      } catch (requestError) {
        console.error("ERRO AO BUSCAR PERFIL:", requestError);
        setError(requestError.message || "Erro ao buscar perfil.");
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
        <p>Carregando seu perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="dashboard-error">
        <h1>Não foi possível carregar seu perfil</h1>
        <p>{error || "Tente entrar novamente."}</p>
        <button type="button" onClick={onLogout}>
          Sair
        </button>
      </div>
    );
  }

  const profileUrl = profile.username
    ? PUBLIC_SINTELE_URL + "/" + encodeURIComponent(profile.username)
    : "";
  const completionFields = [
    Boolean(profile.full_name?.trim()),
    Boolean(profile.username?.trim()),
    Boolean(profile.photo_url?.trim()),
    Boolean(profile.job_title?.trim()),
    Boolean(profile.profession?.trim()),
    Boolean(profile.company_name?.trim()),
    Boolean(profile.bio?.trim()),
    Boolean(profile.city?.trim() && profile.state?.trim()),
    Boolean(profile.phone?.trim()),
  ];
  const profileCompletion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  );
  const hasPublicProfile = Boolean(profile.is_public && profileUrl);

  async function handleShareProfile() {
    if (!profileUrl) {
      window.alert(
        "Adicione um nome de usuário ao perfil para compartilhar o link.",
      );
      onMeuSintele?.();
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Perfil de " + profile.full_name,
          text: "Confira meu perfil profissional no SINTELE.",
          url: profileUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(profileUrl);
      window.alert("Link do perfil copiado!");
    } catch (shareError) {
      if (shareError.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(profileUrl);
        window.alert("Link do perfil copiado!");
      } catch {
        window.prompt("Copie o link do seu perfil:", profileUrl);
      }
    }
  }

  function handleOpenQrCode() {
    if (!profileUrl) {
      window.alert(
        "Adicione um nome de usuário ao perfil para gerar o QR Code.",
      );
      onMeuSintele?.();
      return;
    }
    setShowQrCode(true);
  }

  function confirmLogout() {
    if (window.confirm("Deseja realmente sair do SINTELE?")) {
      onLogout?.();
    }
  }

  const navigation = [
    { label: "Início", icon: "home", action: null },
    { label: "Meu perfil", icon: "user", action: onMeuSintele },
    { label: "Projetos", icon: "folder", action: onProjects },
    { label: "Redes e contatos", icon: "network", action: onSocialContacts },
    {
      label: "Descobrir profissionais",
      icon: "search",
      action: onDiscoverProfessionals,
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <aside
          className="dashboard-sidebar"
          aria-label="Navegação profissional"
        >
          <div>
            <div className="sidebar-brand">
              <span className="brand-icon">S</span>
              <span className="brand-name">SINTELE</span>
            </div>
            <div className="sidebar-account">
              <ProfileAvatar profile={profile} />
              <span className="sidebar-account-copy">
                <strong>
                  {profile.full_name || account?.email || "Meu perfil"}
                </strong>
                <small>Perfil profissional</small>
              </span>
            </div>
            <nav className="sidebar-navigation" aria-label="Menu principal">
              {navigation.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  className={
                    index === 0 ? "sidebar-link active" : "sidebar-link"
                  }
                  onClick={item.action || undefined}
                  aria-current={index === 0 ? "page" : undefined}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                type="button"
                className="sidebar-link"
                onClick={handleOpenQrCode}
              >
                <Icon name="qr" />
                <span>Cartão QR</span>
              </button>
            </nav>
          </div>
          <button
            type="button"
            className="sidebar-logout"
            onClick={confirmLogout}
          >
            <Icon name="logout" />
            <span>Sair da conta</span>
          </button>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-header">
            <div className="dashboard-brand">
              <span className="brand-icon">S</span>
              <span className="brand-name">SINTELE</span>
            </div>
            <div className="dashboard-header-actions">
              <button
                className="header-share-button"
                type="button"
                aria-label="Compartilhar perfil"
                onClick={handleShareProfile}
              >
                <Icon name="share" size={17} />
                <span>Compartilhar perfil</span>
              </button>
              <button
                className="notification-button"
                type="button"
                onClick={() => setShowNotifications(true)}
                aria-label="Abrir notificações"
              >
                <Icon name="bell" size={19} />
              </button>
              <button
                className="header-profile-button"
                type="button"
                onClick={onMeuSintele}
                aria-label={
                  "Abrir perfil de " + (profile.full_name || "usuário")
                }
              >
                <ProfileAvatar profile={profile} />
              </button>
            </div>
          </header>

          <main className="dashboard-content">
            <section className="welcome-section">
              <span className="section-eyebrow">ÁREA PROFISSIONAL</span>
              <h1>
                Olá, {profile.full_name?.split(" ")[0] || "profissional"}!
              </h1>
              <p>
                Gerencie sua presença profissional e fortaleça suas conexões.
              </p>
            </section>

            <section
              className="profile-hero"
              aria-labelledby="profile-hero-title"
            >
              <div className="profile-identity">
                <ProfileAvatar
                  profile={profile}
                  className="profile-avatar-large"
                />
                <div className="profile-identity-copy">
                  <div className="profile-name-row">
                    <h2 id="profile-hero-title">
                      {profile.full_name || "Seu perfil"}
                    </h2>
                    <span
                      className={
                        hasPublicProfile
                          ? "profile-status public"
                          : "profile-status private"
                      }
                    >
                      <span />
                      {hasPublicProfile
                        ? "Perfil público"
                        : profile.is_public
                          ? "Adicione um username"
                          : "Perfil privado"}
                    </span>
                  </div>
                  <p className="profile-role">
                    {profile.job_title ||
                      profile.profession ||
                      "Complete seu cargo e profissão"}
                  </p>
                  {profile.username && (
                    <p className="profile-handle">@{profile.username}</p>
                  )}
                  {(profile.company_name || profile.city || profile.state) && (
                    <p className="profile-meta">
                      {[
                        profile.company_name,
                        [profile.city, profile.state]
                          .filter(Boolean)
                          .join(" - "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="profile-hero-actions">
                {profileUrl ? (
                  <a
                    className="profile-action primary"
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>↗</span> Ver meu perfil
                  </a>
                ) : (
                  <button
                    className="profile-action primary"
                    type="button"
                    onClick={onMeuSintele}
                  >
                    <span>＋</span> Definir link público
                  </button>
                )}
                <button
                  className="profile-action secondary"
                  type="button"
                  onClick={handleShareProfile}
                >
                  <img src={compartilharIcon} alt="" /> Compartilhar perfil
                </button>
                <button
                  className="profile-action qr-action"
                  type="button"
                  onClick={handleOpenQrCode}
                  aria-label="Abrir QR Code"
                >
                  <img src={qrCodeIcon} alt="" /> <span>QR Code</span>
                </button>
              </div>
            </section>

            <section
              className="quick-actions"
              aria-labelledby="quick-actions-title"
            >
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">ATALHOS</span>
                  <h2 id="quick-actions-title">Ações rápidas</h2>
                </div>
              </div>
              <div className="quick-actions-grid">
                <button
                  type="button"
                  className="quick-action"
                  onClick={onMeuSintele}
                >
                  <span className="quick-action-icon">
                    <img src={meuSinteleIcon} alt="" />
                  </span>
                  <span className="quick-action-copy">
                    <strong>Meu perfil</strong>
                    <small>Veja seus dados</small>
                  </span>
                  <span className="quick-action-arrow">→</span>
                </button>
                <button
                  type="button"
                  className="quick-action"
                  onClick={onProjects}
                >
                  <span className="quick-action-icon">
                    <img src={projetoIcon} alt="" />
                  </span>
                  <span className="quick-action-copy">
                    <strong>Projetos</strong>
                    <small>Mostre seu trabalho</small>
                  </span>
                  <span className="quick-action-arrow">→</span>
                </button>
                <button
                  type="button"
                  className="quick-action"
                  onClick={onSocialContacts}
                >
                  <span className="quick-action-icon">
                    <img src={redesIcon} alt="" />
                  </span>
                  <span className="quick-action-copy">
                    <strong>Redes e contatos</strong>
                    <small>Organize seus links</small>
                  </span>
                  <span className="quick-action-arrow">→</span>
                </button>
                <button
                  type="button"
                  className="quick-action"
                  onClick={onDiscoverProfessionals}
                >
                  <span className="quick-action-icon">
                    <Icon name="search" size={20} />
                  </span>
                  <span className="quick-action-copy">
                    <strong>Descobrir profissionais</strong>
                    <small>Conheça a comunidade</small>
                  </span>
                  <span className="quick-action-arrow">→</span>
                </button>
              </div>
            </section>

            <section
              className="completion-card"
              aria-labelledby="completion-title"
            >
              <div className="completion-icon">✓</div>
              <div className="completion-content">
                <div className="completion-heading">
                  <div>
                    <span className="section-eyebrow">FORÇA DO PERFIL</span>
                    <h2 id="completion-title">
                      {profileCompletion === 100
                        ? "Seu perfil está completo"
                        : "Deixe seu perfil mais completo"}
                    </h2>
                  </div>
                  <strong className="completion-percentage">
                    {profileCompletion}%
                  </strong>
                </div>
                <p>
                  {profileCompletion === 100
                    ? "Suas principais informações profissionais já estão preenchidas."
                    : "Preencha seus dados para apresentar melhor sua trajetória no SINTELE."}
                </p>
                <div
                  className="progress-area"
                  role="progressbar"
                  aria-label="Completude do perfil"
                  aria-valuenow={profileCompletion}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className="progress-bar">
                    <div
                      className="progress-value"
                      style={{ width: profileCompletion + "%" }}
                    />
                  </div>
                  <button type="button" onClick={onMeuSintele}>
                    Completar perfil <span>→</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="impact-section" aria-labelledby="impact-title">
              <div className="section-heading impact-heading">
                <div>
                  <span className="section-eyebrow">PERFIL PÚBLICO</span>
                  <h2 id="impact-title">Visualizações e compartilhamentos</h2>
                </div>
                <span className="impact-period">Sintele web</span>
              </div>
              <div className="impact-grid">
                <article className="impact-card">
                  <span className="impact-icon">
                    <img src={eyeIcon} alt="" />
                  </span>
                  <span className="impact-label">Visualizações</span>
                  <strong>—</strong>
                  <small>Dados do perfil público</small>
                </article>
                <article className="impact-card">
                  <span className="impact-icon">
                    <img src={compartilharIcon} alt="" />
                  </span>
                  <span className="impact-label">Compartilhamentos</span>
                  <strong>—</strong>
                  <small>Compartilhamentos no Sintele web</small>
                </article>
              </div>
              <p className="impact-note">
                Os totais serão exibidos quando o Sintele web registrar essas
                ações. Nenhum número estimado é mostrado.
              </p>
            </section>
          </main>

          <nav className="bottom-navigation" aria-label="Navegação principal">
            <button
              className="navigation-item active"
              type="button"
              aria-current="page"
            >
              <Icon name="home" size={20} />
              <small>Início</small>
            </button>
            <button
              className="navigation-item"
              type="button"
              onClick={onMeuSintele}
            >
              <Icon name="user" size={20} />
              <small>Perfil</small>
            </button>
            <button
              className="navigation-item"
              type="button"
              onClick={onProjects}
            >
              <Icon name="folder" size={20} />
              <small>Projetos</small>
            </button>
            <button
              className="navigation-item"
              type="button"
              onClick={onSocialContacts}
            >
              <Icon name="network" size={20} />
              <small>Redes</small>
            </button>
            <button
              className="navigation-item"
              type="button"
              onClick={confirmLogout}
            >
              <Icon name="logout" size={20} />
              <small>Sair</small>
            </button>
          </nav>
        </div>

        {showQrCode && (
          <div
            className="qr-modal-overlay"
            onClick={() => setShowQrCode(false)}
          >
            <div
              className="qr-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="qr-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="qr-modal-close"
                onClick={() => setShowQrCode(false)}
                aria-label="Fechar QR Code"
              >
                <Icon name="close" size={20} />
              </button>
              <span className="modal-eyebrow">CARTÃO DIGITAL</span>
              <h2 id="qr-modal-title">Meu QR Code</h2>
              <p>Escaneie para abrir seu perfil público no SINTELE.</p>
              <div className="qr-code-container">
                <QRCodeCanvas
                  value={profileUrl}
                  size={220}
                  level="H"
                  includeMargin
                />
              </div>
              <a
                className="qr-profile-url"
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profileUrl}
              </a>
              <button
                type="button"
                className="modal-share-button"
                onClick={handleShareProfile}
              >
                <img src={compartilharIcon} alt="" /> Compartilhar perfil
              </button>
            </div>
          </div>
        )}

        {showNotifications && (
          <div
            className="qr-modal-overlay"
            onClick={() => setShowNotifications(false)}
          >
            <div
              className="notifications-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notifications-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="qr-modal-close"
                onClick={() => setShowNotifications(false)}
                aria-label="Fechar notificações"
              >
                <Icon name="close" size={20} />
              </button>
              <span className="notification-modal-icon">
                <Icon name="bell" size={22} />
              </span>
              <h2 id="notifications-title">Notificações</h2>
              <p>
                As notificações do seu perfil aparecerão aqui quando esse
                recurso estiver disponível.
              </p>
              <button
                type="button"
                className="modal-share-button"
                onClick={() => setShowNotifications(false)}
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfessionalDashboard;
