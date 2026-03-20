<div align="center">

<img src="https://raw.githubusercontent.com/LemosMoroni/RegistrosDeAulasSENAI/main/public/Logo-SENAI_EP.png" alt="SENAI" width="280"/>

# RegistroAula — SENAI

**Sistema de registro fotográfico de aulas para professores**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

[🌐 Acessar o sistema](https://lemosmoroni.github.io/RegistrosDeAulasSENAI/)

</div>

---

## 📋 Sobre o projeto

O **RegistroAula** é uma plataforma web desenvolvida para o **SENAI DE LAGES** que permite aos professores registrarem diariamente fotos de suas aulas com título e descrição. Supervisores e administradores podem acompanhar todos os registros em tempo real, filtrar por professor e período, e gerar relatórios em PDF.

---

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com e-mail e senha com opção mostrar/ocultar
- Registro com confirmação de e-mail obrigatória
- Confirmação de senha com barra de força
- Tela dedicada para definição de senha no primeiro acesso
- Redirecionamento automático para troca de senha quando solicitado pelo admin

### 📷 Registro de Aulas
- Upload de até **3 fotos** por registro com preview em tempo real
- Campos de título, data e descrição
- Slots visuais numerados com opção de remover foto individualmente
- Notificação de sucesso ao salvar

### 🖼️ Galeria
- Grid responsivo para mobile, tablet e desktop
- **Paginação** de 12 registros por página
- Filtros por texto, data e professor
- **Modal de visualização** com navegação entre fotos
- Edição de título, data e descrição no modal
- Exclusão com modal de confirmação visual
- **Download** das fotos do registro
- Fallback para imagens indisponíveis

### 📄 Relatório PDF
- Geração formatada com cabeçalho SENAI
- Filtro por professor e período
- Fotos em alta qualidade lado a lado
- Descrição completa de cada aula
- Numeração de páginas automática

### 👨‍💼 Painel Administrativo
- Estatísticas em tempo real
- Cadastro de professores e administradores
- Badge de **"Troca de senha pendente"**
- Redefinição de senha de qualquer professor
- Remoção de usuários

### 🎨 Interface
- Identidade visual completa do **SENAI**
- Navbar responsiva com **menu hamburguer** para mobile
- **Toast flutuante** para notificações
- Modal de confirmação ao excluir
- Animações suaves em todos os elementos

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| [React](https://react.dev) | 18 | Interface e componentes |
| [Vite](https://vitejs.dev) | 5 | Bundler e servidor de desenvolvimento |
| [Tailwind CSS](https://tailwindcss.com) | 3 | Estilização utilitária |
| [Supabase](https://supabase.com) | 2 | Backend, autenticação, banco e storage |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5 | Geração de relatórios PDF |

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ConfirmModal.jsx    # Modal de confirmação de exclusão
│   ├── Navbar.jsx          # Barra de navegação responsiva
│   └── Toast.jsx           # Sistema de notificações flutuantes
├── lib/
│   └── supabase.js         # Configuração do cliente Supabase
├── pages/
│   ├── AdminPage.jsx       # Painel administrativo
│   ├── EmailConfirmedPage.jsx  # Tela pós-confirmação de e-mail
│   ├── GalleryPage.jsx     # Galeria com filtros e modal
│   ├── LoginPage.jsx       # Login e registro
│   ├── PdfPage.jsx         # Gerador de relatório PDF
│   ├── SetPasswordPage.jsx # Definição de senha no primeiro acesso
│   └── UploadPage.jsx      # Formulário de registro de aula
├── App.jsx                 # Componente raiz e controle de navegação
├── index.css               # Estilos globais e Tailwind
└── main.jsx                # Ponto de entrada da aplicação
```

---

## ⚙️ Como rodar localmente

```bash
# Clonar o repositório
git clone https://github.com/LemosMoroni/RegistrosDeAulasSENAI.git
cd RegistrosDeAulasSENAI

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build

# Deploy no GitHub Pages
npm run deploy
```

---

## 🗄️ Configuração do Supabase

### Tabelas necessárias

```sql
-- Perfis dos usuários
CREATE TABLE profiles (
  id                   uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name                 text NOT NULL,
  email                text NOT NULL,
  role                 text NOT NULL DEFAULT 'teacher',
  must_change_password boolean DEFAULT false,
  created_at           timestamptz DEFAULT now()
);

-- Registros de aulas
CREATE TABLE records (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_name text,
  title        text NOT NULL,
  description  text,
  date         date NOT NULL,
  image_url    text,
  image_url_2  text,
  image_url_3  text,
  created_at   timestamptz DEFAULT now()
);
```

### Storage

Crie um bucket público chamado **`aulas`** no Supabase Storage.

### Credenciais

Atualize `src/lib/supabase.js` com suas credenciais:

```js
const SUPA_URL = 'https://SEU-PROJETO.supabase.co'
const SUPA_KEY = 'SUA-CHAVE-ANON'
```

---

## 👤 Perfis de Acesso

| Perfil | Permissões |
|---|---|
| **Professor** | Registrar aulas · Visualizar e editar os próprios registros · Gerar PDF dos próprios registros |
| **Administrador** | Tudo do professor + Visualizar todos os registros · Gerenciar usuários · Redefinir senhas |

---

## 🚀 Deploy

O projeto utiliza **GitHub Pages** com deploy automático via `gh-pages`:

```bash
npm run deploy
```

Após o deploy, configure o **Site URL** e **Redirect URLs** no painel do Supabase em **Authentication → URL Configuration**:

```
Site URL: https://lemosmoroni.github.io/RegistrosDeAulasSENAI/
Redirect URLs: https://lemosmoroni.github.io/RegistrosDeAulasSENAI/**
```

---

<div align="center">

Desenvolvido para o **SENAI - Lages por Vitor Lemos Moroni**

</div>
