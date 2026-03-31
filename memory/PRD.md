# TratorShop - PRD Atualizado

## Última Atualização: 30/03/2026

---

## CORREÇÕES IMPLEMENTADAS NESTA SESSÃO

### 1. Planos Trimestrais ✅
- Badge "Válido por 3 meses" adicionado em ambos os planos no onboarding
- Anúncio Único: 1 anúncio | R$ 49,00 | Válido por 3 meses
- Lojista: 20 anúncios | R$ 149,00 | Válido por 3 meses

### 2. Página do Vendedor ✅
- Perfil público em `/vendedor/{user_id}`
- Mostra: foto, nome, bio, endereço, website, WhatsApp
- Botão compartilhar funcionando
- Lista de anúncios do vendedor

### 3. Link para Perfil do Vendedor no Anúncio ✅
- Página de detalhes do anúncio agora mostra "Ver perfil do vendedor →"
- Link clicável para `/vendedor/{user_id}`

### 4. Upload de Foto de Perfil ✅
- Endpoint `/api/user/profile-picture` funcionando
- Imagens são salvas corretamente no storage
- Frontend atualiza foto após upload
- Foto exibida corretamente em todas as páginas (header, perfil, admin)

### 5. Campo Website no Perfil ✅
- Campo adicionado no modelo de usuário
- Formulário de edição inclui campo website
- Exibido na página pública do vendedor com ícone

### 6. Admin: Visualização e Exclusão de Fotos ✅
- Modal de edição de anúncio mostra galeria de fotos
- Botão de excluir foto individual (hover)
- Endpoint `/api/admin/listings/{id}/images/{index}` DELETE

### 7. Notificação Usuários Pendentes ✅
- Dashboard admin mostra estatísticas de pending_approval
- Tab separada para usuários pendentes

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
- ✅ Mensagem "Entraremos em contato via WhatsApp"

### Perfil do Usuário
- ✅ Upload foto de perfil
- ✅ Edição: nome, telefone, bio, endereço, website
- ✅ Perfil público do vendedor

### Painel Admin
- ✅ Dashboard com estatísticas
- ✅ Gestão de anúncios (aprovar, rejeitar, editar, destacar, expirar)
- ✅ Visualizar e excluir fotos dos anúncios
- ✅ Gestão de usuários completa
- ✅ Promover dealer/admin

---

## CREDENCIAIS

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@tratorshop.com | Admin@123 |
| Usuário | novousuario@teste.com | teste123456 |

---

## REPOSITÓRIO

GitHub: https://github.com/cabiceiraagronegocio-alt/TratorShop3

---

*Atualizado em 30/03/2026*
