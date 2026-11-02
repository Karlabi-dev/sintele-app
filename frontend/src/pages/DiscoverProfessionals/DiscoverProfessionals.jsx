import { useEffect, useState } from "react";
import "./DiscoverProfessionals.css";

const API_URL = "https://sintele-api.onrender.com/api";
const PUBLIC_SINTELE_URL = "https://sintele-web.vercel.app";

function DiscoverProfessionals({ onBack }) {
    const [search, setSearch] = useState("");
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadProfessionals() {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();
                if (search.trim()) {
                    params.set("search", search.trim());
                }

                const response = await fetch(
                    `${API_URL}/public/professionals?${params.toString()}`,
                    { signal: controller.signal }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Erro ao carregar profissionais."
                    );
                }

                setProfessionals(data.professionals || []);
            } catch (requestError) {
                if (requestError.name !== "AbortError") {
                    console.error(
                        "ERRO AO CARREGAR PROFISSIONAIS:",
                        requestError
                    );
                    setError(requestError.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        const timeout = setTimeout(loadProfessionals, search ? 250 : 0);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [search]);

    return (
        <div className="discover-page">
            <div className="discover-container">
                <header className="discover-header">
                    <button
                        type="button"
                        className="discover-back-button"
                        onClick={onBack}
                        aria-label="Voltar"
                    >
                        ←
                    </button>

                    <div className="discover-brand">
                        <span className="discover-brand-icon">S</span>
                        <span>SINTELE</span>
                    </div>
                </header>

                <main className="discover-content">
                    <section className="discover-intro">
                        <span className="discover-eyebrow">
                            COMUNIDADE SINTELE
                        </span>
                        <h1>Conheça quem já está no SINTELE</h1>
                        <p>
                            Descubra profissionais, conheça suas trajetórias
                            e visite seus perfis.
                        </p>
                    </section>

                    <div className="discover-search">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por nome ou username"
                            aria-label="Buscar profissionais por nome ou username"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Limpar busca"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="discover-results-heading">
                        <h2>Profissionais</h2>
                        {!loading && (
                            <span>
                                {professionals.length}{" "}
                                {professionals.length === 1
                                    ? "perfil"
                                    : "perfis"}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="discover-state">
                            <div className="discover-spinner" />
                            <p>Carregando profissionais...</p>
                        </div>
                    ) : error ? (
                        <div className="discover-state discover-error">
                            <p>{error}</p>
                            <button
                                type="button"
                                onClick={() => setSearch((value) => value)}
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : professionals.length === 0 ? (
                        <div className="discover-state">
                            <div className="discover-empty-icon">⌕</div>
                            <h3>Nenhum profissional encontrado</h3>
                            <p>
                                {search
                                    ? "Tente buscar por outro nome ou username."
                                    : "Ainda não há perfis profissionais disponíveis."}
                            </p>
                        </div>
                    ) : (
                        <div className="professionals-grid">
                            {professionals.map((professional) => {
                                const profileUrl =
                                    `${PUBLIC_SINTELE_URL}/${encodeURIComponent(
                                        professional.username
                                    )}`;

                                return (
                                    <a
                                        className="professional-card"
                                        href={profileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={professional.username}
                                    >
                                        <div className="professional-card-top">
                                            <img
                                                className="professional-avatar"
                                                src={
                                                    professional.photoUrl ||
                                                    "/default-avatar.png"
                                                }
                                                alt={`Foto de ${professional.fullName}`}
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        "/default-avatar.png";
                                                }}
                                            />
                                            <span className="professional-open-icon">
                                                ↗
                                            </span>
                                        </div>

                                        <h3>{professional.fullName}</h3>
                                        <span className="professional-username">
                                            @{professional.username}
                                        </span>
                                        <p>
                                            {professional.bio?.trim() ||
                                                "Este profissional ainda não adicionou uma biografia."}
                                        </p>

                                        <span className="professional-card-link">
                                            Conhecer perfil <span>→</span>
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default DiscoverProfessionals;
