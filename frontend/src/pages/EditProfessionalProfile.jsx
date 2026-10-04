import { useEffect, useState } from "react";
import { auth } from "../firebase";

function EditProfessionalProfile({ onBack, onProfileUpdated }) {
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        profession: "",
        companyName: "",
        bio: "",
        city: "",
        state: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
                        data.error || "Erro ao carregar perfil."
                    );
                }

                const profile = data.profile;

                setPhotoUrl(profile.photo_url || "");

                setFormData({
                    fullName: profile.full_name || "",
                    username: profile.username || "",
                    profession: profile.profession || "",
                    companyName: profile.company_name || "",
                    bio: profile.bio || "",
                    city: profile.city || "",
                    state: profile.state || "",
                    phone: profile.phone || "",
                });

            } catch (error) {
                console.error(
                    "ERRO AO CARREGAR PERFIL:",
                    error
                );

                setError(error.message);

            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handlePhotoUpload() {
    if (!photoFile) {
        setError("Selecione uma foto.");
        return;
    }

    setError("");
    setSuccess("");
    setUploadingPhoto(true);

    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("Usuário não autenticado.");
        }

        const token = await user.getIdToken();

        const formData = new FormData();

        formData.append("photo", photoFile);

        const uploadResponse = await fetch(
            "http://localhost:3000/api/upload/profile-photo",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
            throw new Error(
                uploadData.error || "Erro ao enviar foto."
            );
        }

        const photoResponse = await fetch(
            "http://localhost:3000/api/profiles/professional/me/photo",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    photoUrl: uploadData.url,
                }),
            }
        );

        const photoData = await photoResponse.json();

        if (!photoResponse.ok) {
            throw new Error(
                photoData.error ||
                "Erro ao salvar foto no perfil."
            );
        }

        setPhotoUrl(uploadData.url);
        setPhotoFile(null);

        setSuccess(
            "Foto de perfil atualizada com sucesso!"
        );

    } catch (error) {
        console.error(
            "ERRO AO ATUALIZAR FOTO:",
            error
        );

        setError(error.message);

    } finally {
        setUploadingPhoto(false);
    }
}

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("Usuário não autenticado.");
            }

            const token = await user.getIdToken();

            const response = await fetch(
                "http://localhost:3000/api/profiles/professional/me",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erro ao atualizar perfil."
                );
            }

            setFormData({
                fullName: data.profile.full_name || "",
                username: data.profile.username || "",
                profession: data.profile.profession || "",
                companyName: data.profile.company_name || "",
                bio: data.profile.bio || "",
                city: data.profile.city || "",
                state: data.profile.state || "",
                phone: data.profile.phone || "",
            });

            setSuccess("Perfil atualizado com sucesso!");

            if (onProfileUpdated) {
                onProfileUpdated(data.profile);
            }

        } catch (error) {
            console.error(
                "ERRO AO ATUALIZAR PERFIL:",
                error
            );

            setError(error.message);

        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Carregando perfil...</p>;
    }

    return (
        <div>
            <h1>Editar perfil</h1>

            <button
                type="button"
                onClick={onBack}
            >
                Voltar
            </button>

            <div>
    <h2>Foto de perfil</h2>

    {photoUrl && (
        <div>
            <img
                src={photoUrl}
                alt="Foto de perfil"
                width="150"
            />
        </div>
    )}

    <input
        type="file"
        accept="image/*"
        onChange={(event) =>
            setPhotoFile(event.target.files[0])
        }
    />

    <button
        type="button"
        onClick={handlePhotoUpload}
        disabled={uploadingPhoto || !photoFile}
    >
        {uploadingPhoto
            ? "Enviando foto..."
            : "Atualizar foto"}
    </button>
</div>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>
                        Nome completo
                    </label>

                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                    />
                </div>

                <div>
                    <label>
                        Username
                    </label>

                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="seu-username"
                    />
                </div>

                <div>
                    <label>
                        Profissão
                    </label>

                    <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        placeholder="Ex.: Desenvolvedora Full Stack"
                    />
                </div>

                <div>
                    <label>
                        Empresa
                    </label>

                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Nome da empresa"
                    />
                </div>

                <div>
                    <label>
                        Bio
                    </label>

                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Fale um pouco sobre você"
                        rows="5"
                    />
                </div>

                <div>
                    <label>
                        Cidade
                    </label>

                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Ex.: Caucaia"
                    />
                </div>

                <div>
                    <label>
                        Estado
                    </label>

                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Ex.: CE"
                    />
                </div>

                <div>
                    <label>
                        Telefone
                    </label>

                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ex.: (85) 99999-9999"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                >
                    {saving
                        ? "Salvando..."
                        : "Salvar alterações"}
                </button>

            </form>

            {success && (
                <p>{success}</p>
            )}

            {error && (
                <p>{error}</p>
            )}
        </div>
    );
}

export default EditProfessionalProfile;