# TratorShop - PRD (Product Requirements Document)

## Visão Geral
Marketplace de máquinas agrícolas focado no Mato Grosso do Sul (MS), Brasil.

## Stack Técnica
- **Frontend:** React 19, TailwindCSS, Shadcn/UI, React Router v7
- **Backend:** FastAPI (Python), Motor (MongoDB async)
- **Database:** MongoDB
- **Storage:** Emergent Object Storage
- **Auth:** Google OAuth (Emergent) + Email/Password

## Repositório
- **GitHub:** https://github.com/agenciasuportapoio09-art/Trator2.git
- **Branch:** main

---

## User Personas

### 1. Vendedor Individual (account_type: "individual")
- Limite: 3 anúncios ativos
- Role: "user"
- Pode criar conta via Google ou Email/Senha

### 2. Lojista/Dealer (account_type: "dealer")
- Limite: 10 anúncios (expansível pelo admin)
- Role: "dealer"
- Página de loja pública (`/loja/:slug`)
- Perfil de loja personalizável (dealer_profile)

### 3. Administrador
- Collection separada: `admins`
- Acesso via `/admin-login`
- Permissões completas: gerenciar usuários, dealers, anúncios

---

## Core Requirements (Static)

### Autenticação
- [x] Login via Google OAuth
- [x] Login via Email/Senha
- [x] Cadastro de novos usuários
- [x] Sistema de sessões (cookies httpOnly)
- [x] Logout

### Onboarding (NOVO)
- [x] Página `/onboarding` obrigatória após primeiro login
- [x] Pergunta: "Como deseja anunciar?"
- [x] Opção 1: Anúncio Único (individual) - 3 anúncios grátis
- [x] Opção 2: Lojista/Revendedor (dealer) - 10 anúncios + página exclusiva
- [x] Bloqueia acesso ao painel até completar
- [x] Usuários existentes não são afetados

### Anúncios
- [x] Criar anúncio (com imagens)
- [x] Workflow: Pending → Approved → Published
- [x] Editar anúncio próprio
- [x] Deletar anúncio próprio
- [x] Expiração automática (90 dias)
- [x] Sistema de destaque (featured)

### Admin
- [x] Aprovar/Rejeitar anúncios
- [x] Gerenciar usuários
- [x] Promover usuário a Dealer
- [x] Ajustar limites de anúncios

### Upload de Imagens
- [x] Upload para Emergent Object Storage
- [x] Múltiplas imagens por anúncio

---

## Schema do Banco de Dados

### Collection: users
```javascript
{
  user_id: "user_xxxx",
  email: string,
  name: string,
  picture: string | null,
  password_hash: string | null,  // Se login por email
  is_admin: boolean,
  role: "user" | "dealer",
  account_type: "individual" | "dealer",  // Definido no onboarding
  onboarding_complete: boolean,           // Bloqueia até true
  max_listings: number,                   // 3 para individual
  dealer_profile: {                       // Apenas para dealers
    store_name: string,
    store_slug: string,
    store_logo: string | null,
    whatsapp: string,
    city: string,
    description: string,
    max_listings: number,  // 10 inicial
    is_active: boolean,
    created_at: string
  },
  created_at: string
}
```

### Collection: admins (separada)
```javascript
{
  admin_id: "admin_xxxx",
  email: string,
  name: string,
  password_hash: string,
  role: "admin" | "super_admin",
  must_change_password: boolean,
  created_at: string
}
```

---

## O Que Foi Implementado

### 2026-03-22 - Sessão 1
- [x] Clonado repositório do GitHub
- [x] Configurado ambiente (.env files)
- [x] Configurado EMERGENT_LLM_KEY para uploads
- [x] Testado upload de imagens - FUNCIONANDO

### 2026-03-22 - Sessão 2 (Correções de UX)
- [x] Botão "ENTRAR" corrigido: Agora redireciona para `/login`
- [x] Link Admin no Footer: "Área Administrativa"
- [x] Menu Mobile: Botão "Entrar / Cadastrar"

### 2026-03-22 - Sessão 3 (Onboarding)
- [x] Criada página `/onboarding` (full page experience)
- [x] Implementado fluxo: Login → Onboarding → Dashboard
- [x] Opção "Anúncio Único": account_type=individual, max_listings=3
- [x] Opção "Lojista": account_type=dealer, dealer_profile criado, max_listings=10
- [x] Proteção: /dashboard e /anunciar redirecionam para onboarding se incompleto
- [x] Usuários existentes marcados como onboarding_complete=true

---

## Prioritized Backlog

### P0 - Crítico
- Nenhum no momento

### P1 - Alta Prioridade
- [ ] Email: Notificações para aprovação/rejeição de anúncios
- [ ] Permitir alterar tipo de conta nas configurações

### P2 - Média Prioridade
- [ ] Dashboard Admin: Gráficos e métricas avançadas
- [ ] Busca avançada: Filtros por ano, horas de uso
- [ ] Sistema de favoritos para usuários

### P3 - Baixa Prioridade
- [ ] App mobile (React Native)
- [ ] Integração com WhatsApp Business API

---

## Credenciais de Teste

### Usuário Individual
- Email: novousuario@teste.com
- Senha: teste123456
- Tipo: individual (3 anúncios)

### Usuário Lojista
- Email: lojista@teste.com
- Senha: teste123456
- Tipo: dealer (10 anúncios)
- Loja: /loja/tratores-do-vale

### Admin
- Email: admin@tratorshop.com
- Senha: Admin@123

---

*Última atualização: 2026-03-22*
