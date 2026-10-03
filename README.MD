# SINTELE App

Aplicativo do SINTELE — Sistema de Telecomunicações e Tecnologia.

O SINTELE é uma plataforma de identidade profissional e empresarial que busca conectar pessoas, empresas, talentos e oportunidades em um único ecossistema digital.

## 📱 Proposta

O aplicativo terá duas experiências principais:

### 👤 Profissional

Voltada para pessoas físicas que desejam criar e gerenciar sua identidade profissional digital.

Entre as funcionalidades planejadas:

- Perfil profissional
- Informações profissionais
- Redes sociais
- Projetos e portfólio
- Currículo e certificados
- Conexões profissionais
- Compartilhamento por link, QR Code e NFC

### 🏢 Empresa

Voltada para empresas que desejam criar e gerenciar sua identidade empresarial digital.

Entre as funcionalidades planejadas:

- Perfil empresarial
- Informações da empresa
- Equipe e colaboradores
- Projetos e serviços
- Eventos
- Redes sociais
- Compartilhamento do perfil empresarial

## 🔐 Autenticação

A autenticação será realizada utilizando **Firebase Authentication**.

As contas profissional e empresarial serão tratadas como identidades separadas.

## 🗄️ Banco de dados

Os dados da aplicação serão armazenados em **PostgreSQL**, utilizando o **Neon** como serviço de banco de dados.

A comunicação entre o aplicativo e o banco será realizada através de uma API.

## 🛠️ Tecnologias

- JavaScript
- React
- Vite
- Firebase Authentication
- Node.js
- Express
- PostgreSQL
- Neon
- Git
- GitHub

## 🏗️ Arquitetura

```text
SINTELE APP
     │
     ├── React + Vite
     │
     ├── Firebase Authentication
     │
     └── API
          │
          └── PostgreSQL (Neon)

🚧 Status
- Em desenvolvimento.

Este projeto está em fase inicial de desenvolvimento. A arquitetura, banco de dados e funcionalidades serão implementados progressivamente.

🎯 Objetivo

Criar uma plataforma digital capaz de representar a identidade profissional de pessoas e a identidade corporativa de empresas, facilitando a apresentação, conexão e networking entre profissionais e organizações.