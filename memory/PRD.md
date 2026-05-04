# TratorShop - PRD Atualizado

## Última Atualização: 04/05/2026

---

## IMPLEMENTAÇÃO WEB PUSH NOTIFICATIONS (04/05/2026) ✅

### Sistema de Auto-Prompt para Push Notifications
Implementado sistema completo para aumentar a taxa de ativação de notificações push:

1. **Step de Push no Cadastro (NOVO)**
   - Ao clicar "Cadastrar", se push suportado, exibe modal antes de finalizar
   - Modal com benefícios: cadastro aprovado, anúncios aprovados, interessados
   - Botões: "Ativar e Finalizar Cadastro" ou "Pular"
   - Se ativar: solicita permissão, registra SW, salva subscription, finaliza cadastro
   - Se pular: finaliza cadastro normalmente
   - Maior taxa de conversão por capturar no momento de maior intenção

2. **Modal de Ativação Pós-Login (Fallback)**
   - Aparece automaticamente após login para usuários sem subscription
   - Mostra benefícios: aprovação de cadastro, aprovação de anúncios, interessados
   - Botões: "Ativar Notificações" e "Agora não"
   - Usa sessionStorage para não repetir no mesmo acesso

3. **Banner de Reforço (PushNotificationBanner)**
   - Aparece no topo da página se usuário pulou o modal
   - Visual clean com gradiente verde
   - Botão compacto para ativar
   - Pode ser dispensado

4. **Hook usePushNotificationPrompt**
   - Verifica se usuário já tem subscription
   - Gerencia estado de modal/banner
   - Respeita permissão negada do navegador

5. **Triggers de Envio de Push**
   - Quando usuário é aprovado (`approve_user`)
   - Quando anúncio é aprovado (`approve_listing`)
   - Quando anúncio é rejeitado (`reject_listing`)
   - Clique no WhatsApp do anúncio (`record_whatsapp_click`)

6. **Backend Endpoints**
   - `GET /api/push/vapid-public-key` - Retorna chave pública VAPID
   - `POST /api/push/subscribe` - Salva subscription no MongoDB
   - `DELETE /api/push/unsubscribe` - Remove subscriptions
   - `POST /api/push/test` - Envia notificação de teste

7. **Service Worker (sw-push.js)**
   - Recebe push events
   - Exibe notificação nativa do navegador
   - Trata cliques para abrir app

**Testes**: 14/14 passaram (100%) - `/app/test_reports/iteration_11.json`

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
- **Backend**: FastAPI, Motor (MongoDB Async), pywebpush (Web Push)
- **Storage**: Emergent Object Storage
- **Auth**: JWT interno + Google OAuth (Emergent Auth)
- **Push**: Web Push API com VAPID keys

---

## TAREFAS PENDENTES

### P1 - Prioridade Alta
- [ ] Notificações por email (Resend) - Usuário pulou input da API Key
- [ ] Filtros avançados de busca (ano, horas de uso)

### P2 - Prioridade Média
- [ ] Sistema de favoritos
- [ ] Chat entre compradores e vendedores
- [ ] Renomear rota `/tatto/{slug}` para `/vendedor/{slug}` (era do TattoShop)

---

## REPOSITÓRIO

GitHub: https://github.com/cabiceiraagronegocio-alt/TratorShop3

---

*Atualizado em 04/05/2026*
