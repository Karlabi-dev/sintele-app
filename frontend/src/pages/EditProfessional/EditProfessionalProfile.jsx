import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import "./EditProfessionalProfile.css";
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
                    },
                );
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Erro ao carregar perfil.");
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
                console.error("ERRO AO CARREGAR PERFIL:", error);
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
    function handlePhotoSelect(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPhotoUrl(previewUrl);
    }
    async function handlePhotoUpload() {
        if (!photoFile) {
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
            const photoFormData = new FormData();
            photoFormData.append("photo", photoFile);
            const uploadResponse = await fetch(
                "http://localhost:3000/api/upload/profile-photo",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: photoFormData,
                },
            );
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error(uploadData.error || "Erro ao enviar foto.");
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
                },
            );
            const photoData = await photoResponse.json();
            if (!photoResponse.ok) {
                throw new Error(photoData.error || "Erro ao salvar foto no perfil.");
            }
            setPhotoUrl(uploadData.url);
            setPhotoFile(null);
            setSuccess("Foto de perfil atualizada!");
        } catch (error) {
            console.error("ERRO AO ATUALIZAR FOTO:", error);
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
            if (photoFile) {
                await handlePhotoUpload();
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
                },
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Erro ao atualizar perfil.");
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
            console.error("ERRO AO ATUALIZAR PERFIL:", error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    }
    if (loading) {
        return (
            <div className="edit-loading">
                <span>S</span>
                <p>Carregando perfil...</p>
            </div>
        );
    }
    return (
        <div className="edit-profile-page">
            <div className="edit-profile-container">
                <header className="edit-header">
                    <button type="button" className="edit-back" onClick={onBack}>
                        ←
                    </button>
                    <h1>Editar perfil</h1>
                    <button
                        type="submit"
                        form="edit-profile-form"
                        className="edit-save-icon"
                        disabled={saving}
                    >
                        ✓
                    </button>
                </header>
                <main className="edit-content">
                    <section className="edit-photo-section">
                        <div className="edit-photo-wrapper">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt="Foto de perfil"
                                    className="edit-profile-photo"
                                />
                            ) : (
                                <div className="edit-profile-photo empty">
                                    {formData.fullName?.charAt(0)?.toUpperCase() || "S"}
                                </div>
                            )}
                            <label className="photo-camera" htmlFor="profile-photo">
                                📷
                            </label>
                        </div>
                        <input
                            id="profile-photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            hidden
                        />
                        <button
                            type="button"
                            className="change-photo-button"
                            onClick={() => document.getElementById("profile-photo")?.click()}
                        >
                            Alterar foto
                        </button>
                    </section>
                    <form
                        id="edit-profile-form"
                        className="edit-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="edit-field">
                            <label>Nome completo</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div className="edit-field">
                            <label>Profissão</label>
                            <input
                                type="text"
                                name="profession"
                                value={formData.profession}
                                onChange={handleChange}
                                placeholder="Ex.: Desenvolvedora Full Stack"
                            />
                        </div>
                        <div className="edit-field">
                            <label>Empresa</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Nome da empresa"
                            />
                        </div>
                        <div className="edit-field">
                            <label>Biografia</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Fale um pouco sobre você"
                                rows="4"
                            />
                        </div>
                        <div className="edit-extra-fields">
                            <div className="edit-field">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="seu-username"
                                />
                            </div>
                            <div className="edit-row">
                                <div className="edit-field">
                                    <label>Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Estado</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="UF"
                                    />
                                </div>
                            </div>
                            <div className="edit-field">
                                <label>Telefone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(85) 99999-9999"
                                />
                            </div>
                        </div>
                        {error && <div className="edit-message error">{error}</div>}
                        {success && <div className="edit-message success">{success}</div>}
                        <button type="submit" className="edit-submit" disabled={saving}>
                            {saving ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
}
export default EditProfessionalProfile;
