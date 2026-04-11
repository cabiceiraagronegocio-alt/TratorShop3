# TratorShop - PRD Atualizado

## Última Atualização: 11/04/2026

---

## CORREÇÕES IMPLEMENTADAS (11/04/2026)

### 1. WhatsApp Obrigatório no Cadastro ✅
- Campo obrigatório no frontend com validação de 10-13 dígitos
- Validação no backend retorna erro claro: "Informe um WhatsApp válido para continuar"
- Essencial para geração de leads

### 2. Proteção contra Duplicação de Anúncios ✅
- Janela de idempotência de 60 segundos
- Verificação adicional: título + preço iguais em anúncios ativos
- Frontend já tinha proteção contra duplo clique

### 3. Melhorias no Upload Mobile ✅
- Compressão de imagens melhorada (300KB threshold)
- Timeout aumentado para 90 segundos
- Suporte a HEIC/HEIF do iPhone
- Atributo `capture="environment"` para câmera

### 4. Facebook e Instagram no Perfil do Vendedor ✅
- Campos adicionados ao modelo de usuário
- Auto-formatação: `@usuario` → `https://facebook.com/usuario`
- Exibição com ícones na página `/vendedor/{user_id}`

### 5. Modal de Edição Completa do Admin ✅
- Todos os campos: Nome, Email, Senha, WhatsApp, Tipo, Limite, Status, Bio, Endereço, Website, Instagram, Facebook
- Hash bcrypt aplicado ao salvar nova senha
- Validação de email único

### 6. Limpeza de Código ✅
- Removidos endpoints duplicados no backend
- Corrigido `client.close()` que estava fora de função
- Linting 100% sem erros

---

## CORREÇÕES ANTERIORES (30/03/2026)

### Planos Trimestrais ✅
- Badge "Válido por 3 meses" adicionado em ambos os planos
- Anúncio Único: 1 anúncio | R$ 49,00 | Válido por 3 meses
- Lojista: 20 anúncios | R$ 149,00 | Válido por 3 meses

### Página do Vendedor ✅
- Perfil público em `/vendedor/{user_id}`
- Mostra: foto, nome, bio, endereço, website, WhatsApp, Instagram, Facebook

### Upload de Foto de Perfil ✅
- Endpoint `/api/user/profile-picture` funcionando
- Imagens salvas no Emergent Object Storage

### Admin: Gestão Completa ✅
- Dashboard com estatísticas
- Gestão de anúncios (aprovar, rejeitar, editar, destacar, expirar)
- Visualizar e excluir fotos dos anúncios
- Gestão de usuários completa com edição de todos os campos

---

## FUNCIONALIDADES COMPLETAS

### Interface
- ✅ Logo TratorShop
- ✅ Menu responsivo
- ✅ Footer com Instagram
- ✅ Filtro por condição (Novo/Semi-novo/Usado)

### Autenticação & Fluxo
- ✅ Login Email/Senha e Google
- ✅ Status pending_approval até admin liberar
- ✅ WhatsApp obrigatório no cadastro

### Perfil do Usuário
- ✅ Upload foto de perfil
- ✅ Edição: nome, telefone, bio, endereço, website, instagram, facebook
- ✅ Perfil público do vendedor com links sociais

### Painel Admin
- ✅ Dashboard com estatísticas
- ✅ Gestão de anúncios completa
- ✅ Modal de edição completa de usuários
- ✅ Promover dealer/admin

### Anúncios
- ✅ Criação com proteção anti-duplicação
- ✅ Upload de imagens com compressão (mobile-friendly)
- ✅ Suporte a HEIC (iPhone)

---

## CREDENCIAIS DE TESTE

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@tratorshop.com | Admin@123 |
| Usuário | novousuario@teste.com | teste123456 |
| Lojista | lojista@teste.com | teste123456 |

---

## ARQUITETURA

```
/app/
├── backend/
│   ├── server.py           # API FastAPI (~2450 linhas)
│   ├── requirements.txt    
│   └── .env                
├── frontend/
│   ├── src/
│   │   ├── App.js          # Frontend React (~6000 linhas)
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env
└── memory/
    └── PRD.md
```

## STACK TECNOLÓGICA

- **Frontend**: React 19, React Router v7, TailwindCSS, Shadcn/UI, Leaflet
- **Backend**: FastAPI, Motor (MongoDB Async)
- **Storage**: Emergent Object Storage
- **Auth**: JWT interno + Google OAuth (Emergent Auth)

---

## TAREFAS PENDENTES

### P1 - Prioridade Alta
- [ ] Notificações por email para aprovação/rejeição de anúncios
- [ ] Filtros avançados de busca (ano, horas de uso)

### P2 - Prioridade Média
- [ ] Sistema de favoritos
- [ ] Chat entre compradores e vendedores

---

## REPOSITÓRIO

GitHub: https://github.com/cabiceiraagronegocio-alt/TratorShop3

---

*Atualizado em 11/04/2026*
