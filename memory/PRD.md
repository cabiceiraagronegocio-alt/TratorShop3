# TratorShop - PRD (Product Requirements Document)

## Visão Geral
**TratorShop** é um marketplace de máquinas agrícolas focado no Mato Grosso do Sul.

## Stack Técnica
- **Frontend:** React 19 + TailwindCSS + Shadcn/UI + React Router v7 + Leaflet
- **Backend:** FastAPI (Python) + MongoDB (Motor async)
- **Auth:** Emergent Auth (Google OAuth + Email/Senha)
- **Storage:** Object Storage (Emergent Storage API)

## Personas
1. **Vendedor Individual** - Plano Anúncio Único (1 anúncio, R$49)
2. **Lojista/Revendedor** - Plano Lojista (20 anúncios, R$149)
3. **Administrador** - Gerencia todo o marketplace

## Planos de Assinatura

| Plano | Limite | Preço | 1ª Parcela | Validade |
|-------|--------|-------|------------|----------|
| Anúncio Único | 1 | R$49 | R$49 | 3 meses |
| Lojista | 20 | R$149 | R$97 | 3 meses |

## Funcionalidades Implementadas

### ✅ Sistema de Aprovação Manual
- Todos os cadastros passam por aprovação (Google OAuth e email/senha)
- Status: `pending_approval` → `active` ou `rejected`
- Usuário bloqueado de criar anúncios até aprovação
- Dashboard mostra mensagem de aguardando validação

### ✅ Painel Admin - Leads
- Nova aba "Leads" no painel admin
- Lista usuários aguardando contato
- Filtros: aguardando / contatados
- Ações: marcar contatado, aprovar usuário direto
- WhatsApp clicável para contato rápido

### ✅ Painel Admin - Criar Usuário
- Modal para criar usuário manualmente
- Campos: Nome, Email, WhatsApp, Tipo de conta
- Usuário criado já aprovado (status: active)
- Senha auto-gerada ou customizada
- Exibe senha após criação

### ✅ Painel Admin - Usuários Pendentes
- Seção dedicada para usuários aguardando aprovação
- Botões de aprovar/rejeitar
- Exibe plano escolhido e WhatsApp

### ✅ Fluxo de Onboarding com Planos
- Passo 1: Escolher tipo de conta
- Passo 2: Escolher plano e informar WhatsApp
- Passo 3: Mensagem de aguardando validação
- Redirecionamento para completar perfil

### ✅ Página Editar Perfil
- Rota: `/perfil/editar`
- Campos: foto, nome, WhatsApp, bio, endereço, nome da loja
- Upload de foto de perfil
- Integração com storage

### ✅ Autenticação Completa
- Login via Google (Emergent Auth)
- Login via Email/Senha
- Registro com validação
- Sistema de sessões

### ✅ Sistema de Anúncios
- CRUD completo de anúncios
- Upload de imagens (até 10)
- Compressão automática
- Suporte HEIC (iOS)
- Destaque de anúncios (featured)
- Expiração automática (90 dias)

### ✅ Painel Admin Completo
- Dashboard com estatísticas
- Gestão de anúncios
- Gestão de usuários
- Gestão de dealers
- Gestão de leads

### ✅ SEO
- Meta tags dinâmicas
- Títulos otimizados

## Implementações desta sessão (29/03/2026)

### Novas Funcionalidades
1. **Sistema de Aprovação Manual**
   - Campo `status` em users: pending_approval/active/rejected
   - Campo `plan_type`, `plan_price`, `plan_expiration_date`
   - Bloqueio de criação de anúncios para não aprovados

2. **Aba Leads no Admin**
   - GET /api/admin/leads
   - PUT /api/admin/leads/{user_id}/contacted

3. **Aprovar/Rejeitar Usuários**
   - POST /api/admin/users/{user_id}/approve
   - POST /api/admin/users/{user_id}/reject
   - GET /api/admin/users/pending

4. **Criar Usuário Manual**
   - POST /api/admin/users/create

5. **Planos de Assinatura**
   - GET /api/plans
   - POST /api/user/select-plan

6. **Editar Perfil**
   - PUT /api/user/profile
   - POST /api/user/profile/photo
   - Página /perfil/editar

7. **Onboarding com Planos**
   - Fluxo em 3 passos
   - Escolha de plano
   - Mensagem de aguardando validação

## Backlog / Próximos Passos

### P0 - Crítico
- [x] Aprovação manual de usuários
- [x] Painel Admin - Leads
- [x] Criar usuário manual
- [x] Planos de assinatura

### P1 - Importante
- [ ] Notificações por email (anúncio aprovado/rejeitado)
- [ ] Integração de pagamento (PIX/Stripe)
- [ ] Expiração automática de planos
- [ ] Relatórios de vendas

### P2 - Melhorias
- [ ] Dashboard do vendedor com analytics
- [ ] Sistema de favoritos
- [ ] Comparador de máquinas
- [ ] Chat interno

### P3 - Futuro
- [ ] App mobile (React Native)
- [ ] Integração com financiamento
- [ ] Sistema de avaliações
