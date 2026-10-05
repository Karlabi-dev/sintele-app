import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import projetoIcon from "../../assets/icons/projeto.png";
import editIcon from "../../assets/icons/edit.png";
import githubIcon from "../../assets/icons/github.png";
import "./Projects.css";
function Projects({ onBack }) {
    const [projects, setProjects] = useState([]);
    const [allProjectsUrl, setAllProjectsUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [form, setForm] = useState({
        title: "",
        description: "",
        imageUrl: "",
        projectUrl: "",
        githubUrl: "",
    });
    useEffect(() => {
        loadData();
    }, []);
    async function getToken() {
        const user = auth.currentUser;
        if (!user) {
            throw new Error(
                "Usuário não autenticado."
            );
        }
        return await user.getIdToken();
    }
    async function loadData() {
        try {
            setLoading(true);
            setError("");
            const token = await getToken();
            const projectsResponse = await fetch(
                "http://localhost:3000/api/projects/me",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            const projectsData =
                await projectsResponse.json();
            if (!projectsResponse.ok) {
                throw new Error(
                    projectsData.error ||
                    "Erro ao carregar projetos."
                );
            }
            setProjects(
                projectsData.projects || []
            );
            const allProjectsResponse =
                await fetch(
                    "http://localhost:3000/api/projects/me/all-projects-link",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );
            const allProjectsData =
                await allProjectsResponse.json();
            if (allProjectsResponse.ok) {
                setAllProjectsUrl(
                    allProjectsData.allProjectsUrl ||
                    ""
                );
            }
        } catch (error) {
            console.error(
                "ERRO AO CARREGAR PROJETOS:",
                error
            );
            setError(
                error.message ||
                "Erro ao carregar projetos."
            );
        } finally {
            setLoading(false);
        }
    }
    function handleChange(field, value) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
        setError("");
        setSuccess("");
    }
    function handleImageSelect(event) {
        const file =
            event.target.files?.[0];
        if (!file) {
            return;
        }
        if (!file.type.startsWith("image/")) {
            setError(
                "Selecione um arquivo de imagem válido."
            );
            event.target.value = "";
            return;
        }
        const maxSize =
            5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(
                "A imagem deve ter no máximo 5 MB."
            );
            event.target.value = "";
            return;
        }
        setError("");
        setSuccess("");
        setImageFile(file);
        const previewUrl =
            URL.createObjectURL(file);
        setImagePreview(previewUrl);
    }
    async function uploadProjectImage() {
        if (!imageFile) {
            return form.imageUrl;
        }
        setUploadingImage(true);
        try {
            const token =
                await getToken();
            const imageFormData =
                new FormData();
            imageFormData.append(
                "image",
                imageFile
            );
            const uploadResponse =
                await fetch(
                    "http://localhost:3000/api/upload/project-image",
                    {
                        method: "POST",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body: imageFormData,
                    }
                );
            const uploadData =
                await uploadResponse.json();
            if (!uploadResponse.ok) {
                throw new Error(
                    uploadData.error ||
                    "Erro ao enviar imagem."
                );
            }
            return uploadData.url;
        } finally {
            setUploadingImage(false);
        }
    }
    function clearForm() {
        setForm({
            title: "",
            description: "",
            imageUrl: "",
            projectUrl: "",
            githubUrl: "",
        });
        setEditingId(null);
        setImageFile(null);
        setImagePreview("");
        const input =
            document.getElementById(
                "project-image"
            );
        if (input) {
            input.value = "";
        }
    }
    function handleEdit(project) {
        setEditingId(project.id);
        setForm({
            title:
                project.title || "",
            description:
                project.description || "",
            imageUrl:
                project.image_url || "",
            projectUrl:
                project.project_url || "",
            githubUrl:
                project.github_url || "",
        });
        setImageFile(null);
        setImagePreview(
            project.image_url || ""
        );
        setError("");
        setSuccess("");
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }
    async function handleSaveProject() {
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            if (!form.title.trim()) {
                throw new Error(
                    "O nome do projeto é obrigatório."
                );
            }
            const token =
                await getToken();
            let finalImageUrl =
                form.imageUrl;
            if (imageFile) {
                finalImageUrl =
                    await uploadProjectImage();
            }
            const url = editingId
                ? `http://localhost:3000/api/projects/${editingId}`
                : "http://localhost:3000/api/projects";
            const method =
                editingId
                    ? "PUT"
                    : "POST";
            const currentProject =
                editingId
                    ? projects.find(
                        (project) =>
                            project.id ===
                            editingId
                    )
                    : null;
            const response =
                await fetch(
                    url,
                    {
                        method,
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify({
                                title:
                                    form.title.trim(),
                                description:
                                    form.description.trim(),
                                imageUrl:
                                    finalImageUrl ||
                                    "",
                                projectUrl:
                                    form.projectUrl.trim(),
                                githubUrl:
                                    form.githubUrl.trim(),
                                isActive:
                                    currentProject
                                        ?.is_active ||
                                    false,
                            }),
                    }
                );
            const data =
                await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Erro ao salvar projeto."
                );
            }
            if (editingId) {
                setProjects(
                    (previous) =>
                        previous.map(
                            (project) =>
                                project.id ===
                                editingId
                                    ? data.project
                                    : project
                        )
                );
                setSuccess(
                    "Projeto atualizado com sucesso!"
                );
            } else {
                setProjects(
                    (previous) => [
                        ...previous,
                        data.project,
                    ]
                );
                setSuccess(
                    "Projeto criado com sucesso!"
                );
            }
            clearForm();
        } catch (error) {
            console.error(
                "ERRO AO SALVAR PROJETO:",
                error
            );
            setError(
                error.message ||
                "Erro ao salvar projeto."
            );
        } finally {
            setSaving(false);
        }
    }
    async function toggleProject(project) {
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const token =
                await getToken();
            const response =
                await fetch(
                    `http://localhost:3000/api/projects/${project.id}/status`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify({
                                isActive:
                                    !project.is_active,
                            }),
                    }
                );
            const data =
                await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Erro ao alterar status."
                );
            }
            setProjects(
                (previous) =>
                    previous.map(
                        (item) =>
                            item.id ===
                            project.id
                                ? {
                                    ...item,
                                    is_active:
                                        data.project
                                            .is_active,
                                }
                                : item
                    )
            );
            setSuccess(
                data.project.is_active
                    ? "Projeto ativado!"
                    : "Projeto desativado!"
            );
        } catch (error) {
            console.error(
                "ERRO AO ALTERAR STATUS:",
                error
            );
            setError(
                error.message ||
                "Erro ao alterar status."
            );
        } finally {
            setSaving(false);
        }
    }
    async function deleteProject(project) {
        const confirmed =
            window.confirm(
                `Deseja excluir o projeto "${project.title}"?`
            );
        if (!confirmed) {
            return;
        }
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const token =
                await getToken();
            const response =
                await fetch(
                    `http://localhost:3000/api/projects/${project.id}`,
                    {
                        method: "DELETE",
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
                    "Erro ao excluir projeto."
                );
            }
            setProjects(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !==
                            project.id
                    )
            );
            if (
                editingId === project.id
            ) {
                clearForm();
            }
            setSuccess(
                "Projeto excluído com sucesso!"
            );
        } catch (error) {
            console.error(
                "ERRO AO EXCLUIR PROJETO:",
                error
            );
            setError(
                error.message ||
                "Erro ao excluir projeto."
            );
        } finally {
            setSaving(false);
        }
    }
    async function saveAllProjectsUrl() {
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const token =
                await getToken();
            const response =
                await fetch(
                    "http://localhost:3000/api/projects/me/all-projects-link",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                            Authorization:
                                `Bearer ${token}`,
                        },
                        body:
                            JSON.stringify({
                                allProjectsUrl:
                                    allProjectsUrl.trim() ||
                                    null,
                            }),
                    }
                );
            const data =
                await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Erro ao salvar link."
                );
            }
            setAllProjectsUrl(
                data.allProjectsUrl ||
                ""
            );
            setSuccess(
                "Link de todos os projetos salvo!"
            );
        } catch (error) {
            console.error(
                "ERRO AO SALVAR LINK:",
                error
            );
            setError(
                error.message ||
                "Erro ao salvar link."
            );
        } finally {
            setSaving(false);
        }
    }
    if (loading) {
        return (
            <div className="projects-page">
                <div className="projects-loading">
                    <div className="loading-spinner" />
                    <p>
                        Carregando seus projetos...
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="projects-page">
            <div className="projects-container">
                <header className="projects-header">
                    <button
                        type="button"
                        className="back-button"
                        onClick={onBack}
                        disabled={
                            saving ||
                            uploadingImage
                        }
                    >
                        ←
                    </button>
                    <div>
                        <h1>
                            <img
                                src={projetoIcon}
                                alt=""
                                className="title-icon"
                            />
                            Meus projetos
                        </h1>
                        <p>
                            Adicione seus projetos
                            profissionais e escolha
                            quais serão exibidos no
                            seu perfil.
                        </p>
                    </div>
                </header>
                <main className="projects-content">
                    {error && (
                        <div className="projects-message error">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="projects-message success">
                            {success}
                        </div>
                    )}
                    <section className="projects-section">
                        <div className="section-heading">
                            <div>
                                <h2>
                                    {editingId
                                        ? "Editar projeto"
                                        : "Adicionar projeto"}
                                </h2>
                                <p>
                                    {editingId
                                        ? "Atualize as informações do projeto."
                                        : "Cadastre um novo projeto para seu perfil."}
                                </p>
                            </div>
                        </div>
                        <div className="project-form">
                            <div className="form-field">
                                <label>
                                    Nome do projeto
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex.: Trip Planner"
                                    value={form.title}
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                    onChange={(event) =>
                                        handleChange(
                                            "title",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="form-field">
                                <label>
                                    Descrição
                                </label>
                                <textarea
                                    placeholder="Descreva brevemente seu projeto..."
                                    value={
                                        form.description
                                    }
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                    onChange={(event) =>
                                        handleChange(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    rows="4"
                                />
                            </div>
                            <div className="form-field">
                                <label>
                                    Imagem do projeto
                                </label>
                                {imagePreview && (
                                    <div className="project-image-preview">
                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Pré-visualização do projeto"
                                        />
                                    </div>
                                )}
                                <input
                                    id="project-image"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                    onChange={
                                        handleImageSelect
                                    }
                                />
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                "project-image"
                                            )
                                            ?.click()
                                    }
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                >
                                    {imageFile
                                        ? "Alterar imagem"
                                        : imagePreview
                                            ? "Alterar imagem"
                                            : "Escolher imagem"}
                                </button>
                                <small>
                                    JPG, PNG ou WEBP.
                                    Tamanho máximo:
                                    5 MB.
                                </small>
                            </div>
                            <div className="form-field">
                                <label>
                                    Link do projeto
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={
                                        form.projectUrl
                                    }
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                    onChange={(event) =>
                                        handleChange(
                                            "projectUrl",
                                            event.target.value
                                        )
                                    }
                                />
                                <small>
                                    Pode ser GitHub,
                                    portfólio, site do
                                    projeto ou qualquer
                                    outra URL.
                                </small>
                            </div>
                            <div className="form-field">
                                <label>
                                    <img
                                        src={githubIcon}
                                        alt=""
                                        className="field-icon"
                                    />
                                    GitHub do projeto
                                    <span>
                                        (opcional)
                                    </span>
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://github.com/..."
                                    value={
                                        form.githubUrl
                                    }
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                    onChange={(event) =>
                                        handleChange(
                                            "githubUrl",
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="form-actions">
                                {editingId && (
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            clearForm
                                        }
                                        disabled={
                                            saving ||
                                            uploadingImage
                                        }
                                    >
                                        Cancelar edição
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="save-button"
                                    onClick={
                                        handleSaveProject
                                    }
                                    disabled={
                                        saving ||
                                        uploadingImage
                                    }
                                >
                                    {uploadingImage
                                        ? "Enviando imagem..."
                                        : saving
                                            ? "Salvando..."
                                            : editingId
                                                ? "Salvar alterações"
                                                : "Adicionar projeto"}
                                </button>
                            </div>
                        </div>
                    </section>
                    <section className="projects-section">
                        <div className="section-heading">
                            <div>
                                <h2>
                                    Todos os projetos
                                </h2>
                                <p>
                                    Defina o link que será
                                    usado pelo botão
                                    "Ver todos" no seu
                                    perfil público.
                                </p>
                            </div>
                        </div>
                        <div className="all-projects-form">
                            <div className="form-field">
                                <label>
                                    Link de todos os projetos
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={
                                        allProjectsUrl
                                    }
                                    disabled={saving}
                                    onChange={(event) =>
                                        setAllProjectsUrl(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <button
                                type="button"
                                className="save-button"
                                onClick={
                                    saveAllProjectsUrl
                                }
                                disabled={saving}
                            >
                                {saving
                                    ? "Salvando..."
                                    : "Salvar link"}
                            </button>
                        </div>
                    </section>
                    <section className="projects-section">
                        <div className="section-heading">
                            <div>
                                <h2>
                                    Projetos cadastrados
                                </h2>
                                <p>
                                    Você pode cadastrar
                                    quantos projetos quiser,
                                    mas somente 2 podem
                                    ficar ativos no perfil
                                    público.
                                </p>
                            </div>
                            <strong className="active-counter">
                                {
                                    projects.filter(
                                        (project) =>
                                            project.is_active
                                    ).length
                                }
                                /2 ativos
                            </strong>
                        </div>
                        {projects.length === 0 ? (
                            <div className="empty-projects">
                                <span>
                                    📁
                                </span>
                                <strong>
                                    Nenhum projeto cadastrado
                                </strong>
                                <p>
                                    Adicione seu primeiro
                                    projeto acima.
                                </p>
                            </div>
                        ) : (
                            <div className="projects-list">
                                {projects.map(
                                    (project) => (
                                        <article
                                            className={
                                                project.is_active
                                                    ? "project-card active"
                                                    : "project-card"
                                            }
                                            key={
                                                project.id
                                            }
                                        >
                                            <div className="project-card-image">
                                                {project.image_url ? (
                                                    <img
                                                        src={
                                                            project.image_url
                                                        }
                                                        alt={
                                                            project.title
                                                        }
                                                    />
                                                ) : (
                                                    <span>
                                                        {project.title
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                            "P"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="project-card-info">
                                                <div className="project-card-title">
                                                    <h3>
                                                        {
                                                            project.title
                                                        }
                                                    </h3>
                                                    {project.is_active && (
                                                        <span className="active-badge">
                                                            Público
                                                        </span>
                                                    )}
                                                </div>
                                                <p>
                                                    {
                                                        project.description ||
                                                        "Sem descrição."
                                                    }
                                                </p>
                                                {project.project_url && (
                                                    <a
                                                        href={
                                                            project.project_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Abrir projeto ↗
                                                    </a>
                                                )}
                                            </div>
                                            <div className="project-card-actions">
                                                <button
                                                    type="button"
                                                    className={
                                                        project.is_active
                                                            ? "toggle active"
                                                            : "toggle"
                                                    }
                                                    onClick={() =>
                                                        toggleProject(
                                                            project
                                                        )
                                                    }
                                                    disabled={
                                                        saving ||
                                                        uploadingImage
                                                    }
                                                    aria-label={
                                                        project.is_active
                                                            ? "Desativar projeto"
                                                            : "Ativar projeto"
                                                    }
                                                >
                                                    <span />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            project
                                                        )
                                                    }
                                                    disabled={
                                                        saving ||
                                                        uploadingImage
                                                    }
                                                >
                                                    <img
                                                        src={editIcon}
                                                        alt=""
                                                    />
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() =>
                                                        deleteProject(
                                                            project
                                                        )
                                                    }
                                                    disabled={
                                                        saving ||
                                                        uploadingImage
                                                    }
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        )}
                    </section>
                    <div className="projects-bottom-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onBack}
                            disabled={
                                saving ||
                                uploadingImage
                            }
                        >
                            Voltar
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
export default Projects;