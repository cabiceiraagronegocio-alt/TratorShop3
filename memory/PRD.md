# TratorShop - PRD (Product Requirements Document)

## Visão Geral
**TratorShop** é um marketplace de máquinas agrícolas focado no Mato Grosso do Sul.

## Stack Técnica
- **Frontend:** React 19 + TailwindCSS + Shadcn/UI + React Router v7 + Leaflet
- **Backend:** FastAPI (Python) + MongoDB (Motor async)
- **Auth:** Emergent Auth (Google OAuth + Email/Senha)
- **Storage:** Object Storage (Emergent Storage API)

## Planos de Assinatura (Trimestrais - 90 dias)

| Plano | Limite | Preço | 1ª Parcela | Validade |
|-------|--------|-------|------------|----------|
| Anúncio Único | 1 | R$49 | R$49 | 3 meses (trimestral) |
| Lojista | 20 | R$149 | R$97 | 3 meses (trimestral) |

## Correções Aplicadas (29/03/2026 - Sessão 2)

### 1️⃣ Planos - Texto "Trimestral"
- ✅ Adicionado "trimestral" nos textos de planos
- ✅ Texto "válido por 3 meses" na escolha de planos
- ✅ "pagamento trimestral" no card do plano

### 2️⃣ Bug Duplicação de Anúncios
- ✅ Verificação de idempotência no backend (30 segundos)
- ✅ Proteção `if (loading) return;` no frontend
- ✅ Retorna anúncio existente se duplicado

### 3️⃣ Upload de Foto de Perfil
- ✅ Corrigido para usar `put_object` (igual anúncios)
- ✅ Salva caminho no campo `picture` do usuário
- ✅ Funciona com storage Emergent

### 4️⃣ Página Pública do Vendedor
- ✅ Rota: `/vendedor/{userId}`
- ✅ SEO-friendly e indexável
- ✅ Mostra: foto, nome, bio, endereço, anúncios
- ✅ Botão WhatsApp
- ✅ Botão Compartilhar (copia link)
- ✅ Endpoint: `GET /api/vendedor/{user_id}`

### 5️⃣ Limite Lojista = 20
- ✅ Corrigido de 10 para 20 no backend
- ✅ `dealer_profile.max_listings = 20`

### 6️⃣ Filtro Estado do Produto
- ✅ Filtros: Todos, Novo, Semi-novo, Usado
- ✅ Adicionado na SearchPage
- ✅ Backend: `GET /api/listings?condition=novo`

### 7️⃣ Admin - Fotos na Aprovação
- ✅ Fotos visíveis em cada anúncio
- ✅ Botão X para excluir foto individual
- ✅ `DELETE /api/listings/{id}/images/{index}`

### 8️⃣ Admin - Notificação de Pendentes
- ✅ Badge numérico no header
- ✅ Mostra quantidade de usuários pendentes
- ✅ Clicável para ir à aba de usuários

## Funcionalidades Completas

### Sistema de Aprovação Manual
- Status: `pending_approval` → `active` / `rejected`
- Dashboard mostra aviso "em análise"
- Bloqueio de criação de anúncios até aprovação

### Painel Admin
- Dashboard com estatísticas
- Aba Leads (contatos pendentes)
- Aba Anúncios (com fotos e exclusão individual)
- Aba Usuários (com pendentes em destaque)
- Aba Dealers
- Criar usuário manualmente
- Badge de notificação

### Páginas Públicas
- `/vendedor/{userId}` - Perfil do vendedor
- `/loja/{slug}` - Página da loja (dealers)

## Backlog

### P1 - Importante
- [ ] Integração de pagamento (PIX/Stripe)
- [ ] Notificações por email
- [ ] Expiração automática de planos

### P2 - Melhorias
- [ ] Dashboard analytics para vendedor
- [ ] Sistema de favoritos
- [ ] Chat interno

### P3 - Futuro
- [ ] App mobile
- [ ] Sistema de avaliações
