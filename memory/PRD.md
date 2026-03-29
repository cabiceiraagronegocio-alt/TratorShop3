# TratorShop - Documentação Completa do Projeto

## Resumo Executivo
Marketplace de máquinas agrícolas focado no **Mato Grosso do Sul (MS)**, Brasil. Permite que vendedores individuais e lojistas anunciem tratores, implementos, colheitadeiras e peças.

---

## Stack Técnica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19, TailwindCSS, Shadcn/UI, React Router v7, Leaflet |
| **Backend** | FastAPI (Python) com Motor (async MongoDB) |
| **Banco de Dados** | MongoDB |
| **Storage** | Emergent Object Storage (imagens) |
| **Autenticação** | Emergent Auth (Google OAuth + Email/Senha) |

---

## Estrutura de Arquivos Principais

```
/app/
├── backend/
│   ├── server.py          # API FastAPI completa (~1700 linhas)
│   ├── requirements.txt   # Dependências Python
│   └── .env               # Configurações (MONGO_URL, EMERGENT_LLM_KEY)
├── frontend/
│   ├── src/
│   │   ├── App.js         # Aplicação React completa (~4500 linhas)
│   │   ├── App.css        # Estilos
│   │   └── components/ui/ # Componentes Shadcn
│   ├── package.json
│   └── .env               # REACT_APP_BACKEND_URL
└── memory/
    └── PRD.md             # Este arquivo
```

---

## Tipos de Usuário

| Tipo | Limite | Benefícios |
|------|--------|------------|
| **Individual** | 3 anúncios | Grátis, simples |
| **Lojista/Dealer** | 10+ anúncios | Página própria `/loja/nome-da-loja` |
| **Admin** | Ilimitado | Gerencia tudo: usuários, anúncios, dealers |

---

## Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@tratorshop.com | Admin@123 |
| **Individual** | novousuario@teste.com | teste123456 |
| **Lojista** | lojista@teste.com | teste123456 |

---

## Funcionalidades Implementadas

### Sessão 1-3 (Anteriores)
- [x] Setup inicial e clone do repositório
- [x] Configuração de ambiente (.env)
- [x] Login Google e Email/Senha
- [x] Sistema de onboarding (individual vs dealer)
- [x] Upload de imagens com Emergent Object Storage
- [x] Sistema de anúncios com aprovação admin
- [x] Página de loja para dealers
- [x] SEO configurado
- [x] Menu mobile com "Entrar/Cadastrar"
- [x] Link admin no footer

### Sessão 4 (Atual) - 26/03/2026

#### Problema 1: Upload desabilitado (RESOLVIDO)
- [x] Adicionada `EMERGENT_LLM_KEY` ao backend/.env
- [x] Corrigida URL do backend (fallback para localhost em dev)
- [x] Corrigido CORS para suportar credentials com origin dinâmico
- [x] Upload de imagem testado e funcionando via API

#### Problema 2: Painel Admin Completo (RESOLVIDO)

**Anúncios:**
- [x] Editar anúncios (modal completo com todos os campos)
- [x] Alterar status (pending, approved, rejected, expired)
- [x] Destacar/remover destaque (is_featured)
- [x] Expirar manualmente (novo endpoint + botão)
- [x] Tab "Expirados" adicionada
- [x] Botões de ação rápida na tabela (Editar, Aprovar, Rejeitar, Destacar, Expirar, Excluir)

**Usuários:**
- [x] Listar todos usuários com badges de tipo
- [x] Ver anúncios do usuário (modal)
- [x] Alterar limite de anúncios (max_listings)
- [x] Promover para Dealer
- [x] Tornar Admin / Remover Admin
- [x] Excluir usuário

**Segurança:**
- [x] Todas rotas protegidas com `require_admin()`
- [x] Validação backend antes de cada operação

**UX:**
- [x] Ações rápidas na tabela
- [x] Atualização dinâmica sem recarregar página

---

## Novos Endpoints Backend (Sessão 4)

```python
# Expirar anúncio manualmente
POST /api/admin/listings/{listing_id}/expire

# Promover usuário a admin
POST /api/admin/make-admin/{user_id}

# Remover status de admin
POST /api/admin/remove-admin/{user_id}

# Ver anúncios de um usuário específico
GET /api/admin/users/{user_id}/listings
```

---

## Endpoints Existentes (Principais)

### Autenticação
```
POST /api/auth/register          # Cadastro
POST /api/auth/login             # Login
POST /api/auth/logout            # Logout
GET  /api/auth/me                # Usuário atual
POST /api/auth/callback          # Callback Google OAuth
POST /api/onboarding             # Completar onboarding
```

### Anúncios (Público)
```
GET  /api/listings               # Listar anúncios aprovados
GET  /api/listings/{id}          # Detalhes do anúncio
GET  /api/listings/search        # Buscar anúncios
```

### Anúncios (Usuário)
```
POST /api/listings               # Criar anúncio
PUT  /api/listings/{id}          # Editar anúncio
DELETE /api/listings/{id}        # Excluir anúncio
POST /api/listings/{id}/images   # Upload de imagem
```

### Admin
```
POST /api/admin/auth/login       # Login admin
GET  /api/admin/stats            # Estatísticas
GET  /api/admin/users            # Listar usuários
PUT  /api/admin/users/{id}       # Editar usuário
DELETE /api/admin/users/{id}     # Excluir usuário
PUT  /api/admin/users/{id}/limit # Alterar limite
GET  /api/admin/listings         # Listar todos anúncios
PUT  /api/admin/listings/{id}    # Editar anúncio
POST /api/admin/listings/{id}/approve  # Aprovar
POST /api/admin/listings/{id}/reject   # Rejeitar
POST /api/admin/listings/{id}/feature  # Destacar
POST /api/admin/listings/{id}/expire   # Expirar
GET  /api/admin/dealers          # Listar dealers
POST /api/admin/dealers/promote  # Promover a dealer
```

---

## Rotas Frontend

| Rota | Descrição |
|------|-----------|
| `/` | Home com busca e categorias |
| `/login` | Login (email + Google) |
| `/onboarding` | Escolha de tipo de conta |
| `/dashboard` | Painel do usuário |
| `/meus-anuncios` | Meus anúncios |
| `/anunciar` | Criar novo anúncio |
| `/anuncio/{id}` | Detalhes do anúncio |
| `/categoria/{cat}` | Listagem por categoria |
| `/loja/{slug}` | Página da loja (dealer) |
| `/admin-login` | Login admin |
| `/admin` | Painel administrativo |

---

## Problemas Conhecidos

### 1. URL Externa (Preview) - NÃO RESOLVIDO
- **Problema:** URL preview serve site Framer da Emergent em vez do app
- **Causa:** Problema de infraestrutura/roteamento da Emergent
- **Solução:** Contatar suporte da Emergent ou fazer deploy em produção
- **Status:** O app funciona 100% em localhost

### 2. Upload Mobile - PENDENTE
- **Problema:** Upload de imagens falha em alguns celulares
- **Status:** Não investigado ainda

---

## Próximos Passos Sugeridos

### Prioridade Alta
1. [ ] Corrigir problema de URL externa (infra Emergent)
2. [ ] Investigar e corrigir upload mobile

### Prioridade Média
3. [ ] Notificações por email (aprovação/rejeição)
4. [ ] Permitir alterar tipo de conta nas configurações

### Prioridade Baixa
5. [ ] Filtros avançados de busca (ano, horas de uso)
6. [ ] Sistema de favoritos
7. [ ] Chat entre comprador e vendedor

---

## Configuração de Ambiente

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY="sk-emergent-XXXXX"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://[URL_PREVIEW].preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

---

## Comandos Úteis

```bash
# Reiniciar serviços
sudo supervisorctl restart backend frontend

# Ver logs do backend
tail -f /var/log/supervisor/backend.err.log

# Ver logs do frontend
tail -f /var/log/supervisor/frontend.err.log

# Testar API
curl http://localhost:8001/api/

# Acessar MongoDB
mongosh --eval 'db = db.getSiblingDB("test_database"); db.users.find({})'
```

---

## Repositório GitHub
- **Original:** https://github.com/agenciasuportapoio09-art/Trator2.git
- **Novo (salvar):** Tratorshop3

---

## Última Atualização
**Data:** 26/03/2026
**Sessão:** 4
**Status:** Painel Admin completo, aguardando correção de URL externa
