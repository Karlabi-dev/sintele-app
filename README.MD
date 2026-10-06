# SINTELE App

### Sistema de Identidade, Networking e Tecnologia

O SINTELE App é a aplicação responsável pelo gerenciamento da identidade profissional dentro do ecossistema SINTELE.

O aplicativo e o SINTELE Web trabalham em conjunto: o usuário gerencia seus dados pelo aplicativo e seu perfil profissional pode ser compartilhado através de uma página pública no SINTELE Web.

## 📱 O que já foi desenvolvido

### 👤 Área profissional

Atualmente, a área profissional conta com:

- Cadastro de usuário
- Login e autenticação
- Perfil profissional
- Edição do perfil profissional
- Foto de perfil
- Nome e profissão
- Cargo
- Empresa
- Biografia
- Cidade e estado
- Contatos
- Redes sociais
- Projetos
- Compartilhamento do perfil
- Geração de QR Code
- Link público do perfil

O perfil público é gerado a partir do username e utiliza o SINTELE Web para sua apresentação.

### 🔗 Compartilhamento

O aplicativo gera o link público do perfil no formato:

`https://sintele-web.vercel.app/{username}`

Também é possível gerar um QR Code utilizando o mesmo endereço público.

### 📊 Dashboard

O aplicativo possui um dashboard profissional com:

- Resumo do perfil
- Ações rápidas
- Compartilhamento do perfil
- QR Code
- Acesso aos projetos
- Acesso ao Meu SINTELE
- Acesso às redes e contatos

Alguns indicadores do dashboard ainda estão sendo preparados para integração com dados reais.

## 🌐 Integração com o SINTELE Web

O SINTELE App e o SINTELE Web são partes do mesmo projeto.

O aplicativo é responsável pelo gerenciamento das informações do profissional, enquanto o SINTELE Web apresenta essas informações em um perfil público.

Fluxo atual:

```text
SINTELE App
     │
     │ gerenciamento do perfil
     ▼
API SINTELE
     │
     │ dados do perfil
     ▼
SINTELE Web
     │
     │ perfil público
     ▼
Link / QR Code
```

Perfil público:

`https://sintele-web.vercel.app/{username}`

## 🔐 Autenticação

A autenticação é realizada utilizando **Firebase Authentication**.

## 🗄️ Banco de dados

Os dados são armazenados em **PostgreSQL**, utilizando **Neon**.

A comunicação entre o frontend e o banco é realizada através de uma API em Node.js e Express.

## ☁️ Backend

O backend está hospedado no **Render** e é responsável pela API do SINTELE.

Principais integrações utilizadas:

- Firebase Admin
- PostgreSQL / Neon
- Cloudinary
- API REST

## 🛠️ Tecnologias

### Frontend

- JavaScript
- React
- Vite
- Firebase Authentication

### Backend

- Node.js
- Express
- PostgreSQL
- Neon
- Firebase Admin
- Cloudinary

### Desenvolvimento

- Git
- GitHub

## 🚧 Status

O SINTELE App está em desenvolvimento.

A área profissional e sua integração com o SINTELE Web já possuem uma base funcional. Novas funcionalidades ainda estão sendo desenvolvidas.

## 🔮 Próximos desenvolvimentos

Entre os recursos que ainda serão desenvolvidos estão funcionalidades de relacionamento e métricas, como:

- Conexões profissionais
- Seguidores
- Visualizações do perfil
- Indicadores reais no dashboard
- Outras funcionalidades de networking

A versão empresarial do SINTELE também faz parte da evolução do projeto, mas ainda está em desenvolvimento.

## 👩‍💻 Desenvolvedora

**Karla Bianca**  
Desenvolvedora Full Stack e criadora do SINTELE.

- 📧 E-mail: [karlabianca2319@gmail.com](mailto:karlabianca2319@gmail.com)
- 💼 LinkedIn: [Karla Bianca](https://www.linkedin.com/in/karla-bianca-563734355/)
- 📸 Instagram: [@karla.bi_](https://www.instagram.com/karla.bi_/)
- 🐙 GitHub: [Karlabi-dev](https://github.com/Karlabi-dev)

---

**SINTELE — conectando pessoas, talentos e oportunidades.**
