# TratorShop - PRD (Product Requirements Document)

## Visão Geral
**TratorShop** é um marketplace de máquinas agrícolas focado no Mato Grosso do Sul.

## Stack Técnica
- **Frontend:** React 19 + TailwindCSS + Shadcn/UI + React Router v7 + Leaflet
- **Backend:** FastAPI (Python) + MongoDB (Motor async)
- **Auth:** Emergent Auth (Google OAuth + Email/Senha)
- **Storage:** Object Storage (Emergent Storage API)

## Logo e Branding

### Arquivos de Logo
- `logo-light.png` - Logo 1200x400 para fundo claro (header)
- `logo-dark.png` - Logo 1200x400 para fundo escuro (footer, admin)
- `logo-512.png` - Logo 512x512 para PWA e redes sociais

### Favicons
- `favicon.ico` - Multi-size (48, 32, 16)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`

### Cores da Marca
- Verde principal: `#1A4D2E`
- Amarelo destaque: `#F9C02D`
- Branco: `#FFFFFF`

## Implementação de Logo (29/03/2026)

### Header (fundo branco)
- Usa `logo-light.png`
- Responsiva com height fixo

### Footer (fundo verde)
- Usa `logo-dark.png`
- Adapta automaticamente ao tema

### Admin (fundo escuro)
- Usa `logo-dark.png`
- Aplicada em login e painel

### Meta Tags
- Open Graph configurado
- Twitter Cards configurado
- PWA Manifest com ícones

## Planos de Assinatura (Trimestrais)

| Plano | Limite | Preço | 1ª Parcela | Validade |
|-------|--------|-------|------------|----------|
| Anúncio Único | 1 | R$49 | R$49 | 3 meses |
| Lojista | 20 | R$149 | R$97 | 3 meses |

## Funcionalidades Principais

### Sistema de Aprovação Manual
- Status: `pending_approval` → `active` / `rejected`
- Bloqueio de criação até aprovação

### Painel Admin
- Dashboard com estatísticas
- Leads (contatos pendentes)
- Anúncios (com fotos e exclusão individual)
- Usuários (com pendentes)
- Dealers
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
