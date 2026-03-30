# TratorShop - PRD (Product Requirements Document)

## Última Atualização: 26/03/2026 - Sessão 4

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

## MELHORIAS FEITAS NESTA SESSÃO (26/03/2026)

### 1. Correção do Upload de Imagens
| Item | Status |
|------|--------|
| Adicionada EMERGENT_LLM_KEY no backend/.env | ✅ |
| Corrigido CORS para suportar credentials | ✅ |
| URL do backend com fallback para localhost | ✅ |
| Upload testado e funcionando | ✅ |

### 2. Painel Admin Completo

#### Gerenciamento de Anúncios
| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| Editar anúncios | ✅ | Modal completo com todos os campos |
| Alterar status | ✅ | pending/approved/rejected/expired |
| Destacar anúncio | ✅ | is_featured = true/false |
| Expirar manualmente | ✅ | Novo endpoint + botão |
| Tab "Expirados" | ✅ | Nova tab no filtro |
| Ações rápidas | ✅ | Botões direto na tabela |

#### Gerenciamento de Usuários
| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| Listar usuários | ✅ | Com badges de tipo |
| Ver anúncios do usuário | ✅ | Modal com listagem |
| Alterar limite | ✅ | max_listings editável |
| Promover para Dealer | ✅ | Botão na tabela |
| Tornar/Remover Admin | ✅ | Toggle de admin |
| Excluir usuário | ✅ | Com confirmação |

### 3. Novos Endpoints Criados

```python
POST /api/admin/listings/{id}/expire      # Expirar anúncio
POST /api/admin/make-admin/{user_id}      # Promover a admin
POST /api/admin/remove-admin/{user_id}    # Remover admin
GET  /api/admin/users/{user_id}/listings  # Ver anúncios do usuário
```

### 4. Arquivos Modificados

| Arquivo | Alterações |
|---------|------------|
| `/app/backend/server.py` | +4 novos endpoints, CORS dinâmico |
| `/app/frontend/src/App.js` | +3 modais, +6 handlers, nova tab |
| `/app/backend/.env` | +EMERGENT_LLM_KEY |

---

## PROBLEMA PENDENTE

### URL Externa não funciona
- **Problema:** URL preview serve site Framer da Emergent
- **URL:** `https://0605c11c-4624-473a-bcf6-40c676c7e54c.preview.emergentagent.com`
- **Causa:** Problema de infraestrutura da Emergent (roteamento)
- **Workaround:** App funciona 100% em localhost
- **Solução:** Contatar suporte Emergent ou fazer deploy em produção

---

## CREDENCIAIS DE ACESSO

| Tipo | Email | Senha | Rota |
|------|-------|-------|------|
| **Admin** | admin@tratorshop.com | Admin@123 | /admin-login |
| **Usuário** | novousuario@teste.com | teste123456 | /login |
| **Lojista** | lojista@teste.com | teste123456 | /login |

---

## PRÓXIMOS PASSOS (TODO)

### Prioridade Alta
- [ ] Resolver problema de URL externa (infra Emergent)
- [ ] Corrigir upload mobile (falha em alguns celulares)

### Prioridade Média
- [ ] Notificações por email (aprovação/rejeição)
- [ ] Permitir alterar tipo de conta nas configurações

### Prioridade Baixa
- [ ] Filtros avançados (ano, horas de uso)
- [ ] Sistema de favoritos
- [ ] Chat entre comprador e vendedor

---

## ESTRUTURA DO PROJETO

```
/app/
├── backend/
│   ├── server.py           # API FastAPI (~1700 linhas)
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js          # React App (~4500 linhas)
│   │   ├── App.css
│   │   └── components/ui/  # Shadcn
│   ├── package.json
│   └── .env
└── memory/
    └── PRD.md              # Este arquivo
```

---

## COMANDOS ÚTEIS

```bash
# Reiniciar serviços
sudo supervisorctl restart backend frontend

# Logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log

# Testar API
curl http://localhost:8001/api/

# MongoDB
mongosh --eval 'db = db.getSiblingDB("test_database"); db.users.find({})'
```

---

## REPOSITÓRIOS

- **Origem:** https://github.com/agenciasuportapoio09-art/Trator2.git
- **Destino:** Tratorshop3 (a ser salvo via "Save to Github")

---

## STATUS GERAL

| Componente | Status | Observação |
|------------|--------|------------|
| Backend API | ✅ 100% | Todos endpoints funcionando |
| Frontend React | ✅ 100% | Painel admin completo |
| MongoDB | ✅ OK | Dados persistidos |
| Upload Imagens | ✅ OK | Storage Emergent configurado |
| URL Externa | ❌ Falha | Problema de infra Emergent |
| Upload Mobile | ⚠️ Pendente | Não investigado |

---

*Documento atualizado em 26/03/2026 após implementação do Painel Admin completo.*
