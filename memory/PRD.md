# TratorShop - PRD (Product Requirements Document)

## Última Atualização: 30/03/2026

---

## RESUMO EXECUTIVO

Marketplace de máquinas agrícolas focado no **Mato Grosso do Sul (MS)**, Brasil.

### Stack
- **Frontend:** React 19 + TailwindCSS + Shadcn/UI
- **Backend:** FastAPI + MongoDB (Motor async)
- **Auth:** Emergent Auth (Google OAuth + Email/Senha)
- **Storage:** Emergent Object Storage

---

## PLANOS (TRIMESTRAIS - 3 meses)

| Plano | Anúncios | Preço | Observação |
|-------|----------|-------|------------|
| **Anúncio Único** | 1 | R$ 49,00 | - |
| **Lojista** | 20 | R$ 149,00 | 1ª parcela R$ 97,00 |

---

## FLUXO DE APROVAÇÃO

1. Usuário se cadastra
2. Status inicial: `pending_approval`
3. Mensagem: "Cadastro em Análise - Entraremos em contato via WhatsApp"
4. Admin libera usuário manualmente
5. Status muda para `active`

---

## FUNCIONALIDADES IMPLEMENTADAS

### Interface
- ✅ Logo TratorShop (header e footer)
- ✅ Menu responsivo
- ✅ Footer com Instagram, email, cidades
- ✅ Hero com busca
- ✅ Categorias com imagens
- ✅ Filtro por condição (Novo/Semi-novo/Usado)

### Autenticação
- ✅ Login Email/Senha
- ✅ Login Google OAuth
- ✅ Sistema de onboarding
- ✅ Status pending_approval
- ✅ Mensagem WhatsApp aguardando liberação

### Perfil do Usuário
- ✅ Upload de foto de perfil
- ✅ Edição de nome, telefone, bio
- ✅ Edição de endereço
- ✅ Edição de website/redes sociais
- ✅ Perfil público do vendedor (/vendedor/{id})
- ✅ Botão compartilhar mini site

### Anúncios
- ✅ Criar anúncio com múltiplas imagens
- ✅ Proteção contra duplicação
- ✅ Limite por plano (1 ou 20)
- ✅ Status: pending, approved, rejected, expired
- ✅ Preços formatados em R$
- ✅ WhatsApp para contato

### Painel Admin Completo
- ✅ Dashboard com estatísticas
- ✅ Notificação de usuários pendentes
- ✅ **Gestão de Anúncios:**
  - Aprovar/Rejeitar
  - Editar todos os campos
  - Alterar status
  - Destacar (featured)
  - Expirar manualmente
  - Tab "Expirados"
  - **Visualizar fotos do anúncio**
  - **Excluir fotos individuais**
- ✅ **Gestão de Usuários:**
  - Listar todos
  - Ver anúncios do usuário
  - Alterar limite de anúncios
  - Promover para Dealer
  - Tornar/Remover Admin
  - Excluir usuário

---

## CREDENCIAIS DE TESTE

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@tratorshop.com | Admin@123 |
| **Usuário** | novousuario@teste.com | teste123456 |
| **Lojista** | lojista@teste.com | teste123456 |

---

## ENDPOINTS API

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/callback
POST /api/onboarding
```

### Perfil do Usuário
```
GET  /api/user/profile
PUT  /api/user/profile
POST /api/user/profile-picture    # Upload foto
GET  /api/user/public/{user_id}   # Perfil público
GET  /api/vendedor/{user_id}      # Página vendedor
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
DELETE /api/admin/listings/{id}/images/{index}  # Excluir foto
POST /api/admin/make-admin/{user_id}
POST /api/admin/remove-admin/{user_id}
GET  /api/admin/users/{user_id}/listings
```

---

## ROTAS FRONTEND

| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/login` | Login |
| `/onboarding` | Escolha de plano |
| `/dashboard` | Painel do usuário |
| `/meus-anuncios` | Meus anúncios |
| `/anunciar` | Criar anúncio |
| `/anuncio/{id}` | Detalhes |
| `/perfil/editar` | Editar perfil |
| `/vendedor/{id}` | Perfil público |
| `/categoria/{cat}` | Por categoria |
| `/loja/{slug}` | Página da loja |
| `/admin-login` | Login admin |
| `/admin` | Painel admin |

---

## MELHORIAS IMPLEMENTADAS (30/03/2026)

1. ✅ Plano lojista = 20 anúncios (já estava correto)
2. ✅ Upload foto de perfil funcionando
3. ✅ Campo website no perfil
4. ✅ Perfil público com foto, nome, bio, endereço, website
5. ✅ Admin visualiza fotos ao editar anúncio
6. ✅ Admin pode excluir fotos individuais
7. ✅ Dashboard mostra usuários pendentes
8. ✅ Filtro Novo/Semi-novo/Usado já existia

---

## PROBLEMA CONHECIDO

### URL Preview
- URL preview pode servir site Framer em vez do app
- **Solução:** Funciona em localhost ou deploy em produção

---

## PRÓXIMOS PASSOS

1. [ ] Resolver URL externa (infra Emergent)
2. [ ] Corrigir upload mobile
3. [ ] Notificações por email
4. [ ] Sistema de favoritos
5. [ ] Filtros avançados

---

## COMANDOS ÚTEIS

```bash
# Reiniciar serviços
sudo supervisorctl restart backend frontend

# Logs
tail -f /var/log/supervisor/backend.err.log

# API
curl http://localhost:8001/api/

# MongoDB
mongosh --eval 'db = db.getSiblingDB("test_database"); db.users.find({})'
```

---

## REPOSITÓRIO

- **GitHub:** https://github.com/cabiceiraagronegocio-alt/TratorShop3
- **Branch:** conflict_290326_1841

---

*Atualizado em 30/03/2026 - Todas as melhorias solicitadas implementadas*
