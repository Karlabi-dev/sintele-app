import { useEffect, useState } from "react";
import { auth } from "../firebase";

function ProfessionalDashboard({
    account,
    onLogout,
    onEditProfile
}) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        return <p>Carregando perfil...</p>;
    }

    if (error) {
        return (
            <div>
                <h1>Erro</h1>

                <p>{error}</p>

                <button onClick={onLogout}>
                    Sair
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1>SINTELE</h1>

            <h2>
                Olá, {profile.full_name}! 👋
            </h2>

            <p>
                E-mail: {account.email}
            </p>

            <hr />

            <h3>Meu perfil</h3>

            <p>
                <strong>Nome:</strong>{" "}
                {profile.full_name}
            </p>

            <p>
                <strong>Profissão:</strong>{" "}
                {profile.profession || "Não informado"}
            </p>

            <p>
                <strong>Empresa:</strong>{" "}
                {profile.company_name || "Não informado"}
            </p>

            <p>
                <strong>Bio:</strong>{" "}
                {profile.bio || "Não informado"}
            </p>

            <p>
                <strong>Cidade:</strong>{" "}
                {profile.city || "Não informado"}
            </p>

            <p>
                <strong>Estado:</strong>{" "}
                {profile.state || "Não informado"}
            </p>

            <p>
                <strong>Telefone:</strong>{" "}
                {profile.phone || "Não informado"}
            </p>

            <hr />

            <button onClick={onEditProfile}>
                Editar perfil
            </button>

            <button onClick={onLogout}>
                Sair
            </button>
        </div>
    );
}

export default ProfessionalDashboard;