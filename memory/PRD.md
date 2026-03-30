# TratorShop - PRD (Product Requirements Document)

## Última Atualização: 30/03/2026

---

## RESUMO PARA PRÓXIMO AGENTE

### O que é o TratorShop?
Marketplace de máquinas agrícolas focado no Mato Grosso do Sul (MS), Brasil.

### Stack
- **Frontend:** React 19 + TailwindCSS + Shadcn/UI + React Router v7
- **Backend:** FastAPI + MongoDB (Motor async)
- **Auth:** Emergent Auth (Google OAuth + Email/Senha)
- **Storage:** Emergent Object Storage (upload de imagens)

---

## FUNCIONALIDADES COMPLETAS

### Interface
- ✅ Logo TratorShop (header e footer)
- ✅ Menu responsivo (Tratores, Implementos, Colheitadeiras, Peças)
- ✅ Hero com imagem de fundo e busca
- ✅ Categorias com imagens
- ✅ Footer com Instagram, email, cidades
- ✅ Área Administrativa (link no footer)

### Autenticação
- ✅ Login com Email/Senha
- ✅ Login com Google OAuth
- ✅ Sistema de onboarding (individual vs dealer)
- ✅ Logout

### Anúncios
- ✅ Criar anúncio com imagens
- ✅ Upload de múltiplas imagens
- ✅ Categorias (tratores, implementos, colheitadeiras, peças)
- ✅ Preços formatados em R$
- ✅ Busca por cidade
- ✅ Detalhes do anúncio
- ✅ WhatsApp para contato

### Painel Admin Completo
- ✅ Login admin separado
- ✅ Dashboard com estatísticas
- ✅ Gerenciar anúncios (aprovar, rejeitar, editar, excluir)
- ✅ Tab "Expirados" para anúncios vencidos
- ✅ Expirar anúncio manualmente
- ✅ Destacar anúncio (featured)
- ✅ Gerenciar usuários (listar, editar, excluir)
- ✅ Alterar limite de anúncios por usuário
- ✅ Promover para Dealer
- ✅ Tornar/Remover Admin
- ✅ Ver anúncios de um usuário específico
- ✅ Gerenciar dealers

---

## CREDENCIAIS DE ACESSO

| Tipo | Email | Senha | Rota |
|------|-------|-------|------|
| **Admin** | admin@tratorshop.com | Admin@123 | /admin-login |
| **Usuário** | novousuario@teste.com | teste123456 | /login |
| **Lojista** | lojista@teste.com | teste123456 | /login |

---

## ENDPOINTS API

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/callback (Google OAuth)
POST /api/onboarding
```

### Anúncios
```
GET  /api/listings
GET  /api/listings/{id}
POST /api/listings
PUT  /api/listings/{id}
DELETE /api/listings/{id}
POST /api/listings/{id}/images
```

### Admin
```
POST /api/admin/auth/login
GET  /api/admin/stats
GET  /api/admin/users
PUT  /api/admin/users/{id}
DELETE /api/admin/users/{id}
PUT  /api/admin/users/{id}/limit
GET  /api/admin/listings
PUT  /api/admin/listings/{id}
POST /api/admin/listings/{id}/approve
POST /api/admin/listings/{id}/reject
POST /api/admin/listings/{id}/feature
POST /api/admin/listings/{id}/expire
POST /api/admin/make-admin/{user_id}
POST /api/admin/remove-admin/{user_id}
GET  /api/admin/users/{user_id}/listings
GET  /api/admin/dealers
POST /api/admin/dealers/promote
```

---

## ROTAS FRONTEND

| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/login` | Login |
| `/onboarding` | Escolha de tipo de conta |
| `/dashboard` | Painel do usuário |
| `/meus-anuncios` | Meus anúncios |
| `/anunciar` | Criar anúncio |
| `/anuncio/{id}` | Detalhes |
| `/categoria/{cat}` | Por categoria |
| `/loja/{slug}` | Página da loja |
| `/admin-login` | Login admin |
| `/admin` | Painel admin |

---

## ARQUIVOS IMPORTANTES

```
/app/
├── backend/
│   ├── server.py           # API (~2234 linhas)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── public/
│   │   ├── logo-light.png  # Logo fundo claro
│   │   ├── logo-dark.png   # Logo fundo escuro
│   │   └── favicon.ico
│   ├── src/
│   │   ├── App.js          # React App (~5632 linhas)
│   │   └── components/ui/
│   ├── package.json
│   └── .env
└── memory/
    └── PRD.md
```

---

## CONFIGURAÇÃO

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY="sk-emergent-XXXXX"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://[URL].preview.emergentagent.com
WDS_SOCKET_PORT=443
```

---

## COMANDOS

```bash
# Reiniciar serviços
sudo supervisorctl restart backend frontend

# Logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log

# API
curl http://localhost:8001/api/

# MongoDB
mongosh --eval 'db = db.getSiblingDB("test_database"); db.users.find({})'
```

---

## PROBLEMA CONHECIDO

### URL Preview não funciona
- A URL preview serve site Framer da Emergent
- **Solução:** App funciona em localhost ou fazer deploy em produção

---

## PRÓXIMOS PASSOS

1. [ ] Resolver URL externa (infra Emergent)
2. [ ] Corrigir upload mobile
3. [ ] Notificações por email
4. [ ] Sistema de favoritos
5. [ ] Filtros avançados

---

## REPOSITÓRIO

- **GitHub:** https://github.com/cabiceiraagronegocio-alt/TratorShop3
- **Branch:** conflict_290326_1841

---

*Atualizado em 30/03/2026*
