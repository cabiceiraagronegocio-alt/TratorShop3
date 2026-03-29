# TratorShop - PRD (Product Requirements Document)

## Visão Geral
**TratorShop** é um marketplace de máquinas agrícolas focado no Mato Grosso do Sul.

## Stack Técnica
- **Frontend:** React 19 + TailwindCSS + Shadcn/UI + React Router v7 + Leaflet
- **Backend:** FastAPI (Python) + MongoDB (Motor async)
- **Auth:** Emergent Auth (Google OAuth + Email/Senha)
- **Storage:** Object Storage (Emergent Storage API)

## Personas
1. **Vendedor Individual** - Pode criar até 3 anúncios
2. **Dealer (Loja)** - Limite personalizável (padrão 10-20 anúncios)
3. **Administrador** - Gerencia todo o marketplace

## Funcionalidades Implementadas

### ✅ Autenticação
- Login via Google (Emergent Auth)
- Login via Email/Senha
- Registro de novos usuários
- Sistema de onboarding (Individual vs Dealer)

### ✅ Sistema de Anúncios
- CRUD completo de anúncios
- Upload de imagens (até 10 por anúncio)
- Compressão automática de imagens
- Suporte HEIC (iOS)
- Categorias: Tratores, Implementos, Colheitadeiras, Peças
- Status: Pendente, Aprovado, Rejeitado, Expirado
- Destaque de anúncios (featured)
- Expiração automática (90 dias)

### ✅ Painel Admin
- Dashboard com estatísticas
- Gestão de anúncios (aprovar/rejeitar/editar/deletar/destacar/expirar)
- Gestão de usuários (limites/promover/admin/deletar)
- Gestão de dealers (criar/limites/ativar/desativar)

### ✅ SEO
- Meta tags dinâmicas
- Títulos otimizados por página

### ✅ Integrações
- WhatsApp (click-to-chat com tracking)
- Leaflet (mapas de localização)
- Emergent Storage (upload de arquivos)

## O que foi implementado nesta sessão (29/03/2026)

### Correções Aplicadas
1. **EMERGENT_LLM_KEY configurada** - Upload de imagens funcionando
2. **Upload Mobile melhorado:**
   - Removido `capture="environment"` que causava problemas
   - Timeout aumentado para 60s
   - Tratamento de arquivos sem tipo definido (comum em iOS)
   - Compressão ativa para arquivos > 500KB
   - Melhor tratamento de erros com mensagens claras

3. **Painel Admin verificado e funcionando:**
   - Todas as funcionalidades estão conectadas ao UI
   - Editar anúncios ✓
   - Alterar limites de usuários ✓
   - Promover para dealer/admin ✓
   - Destacar anúncios ✓
   - Expirar anúncios manualmente ✓

4. **Fluxo de troca de senha admin melhorado**
   - Atualiza estado do contexto após troca de senha

## Backlog / Próximos Passos

### P0 - Crítico
- [x] Upload mobile funcional
- [x] Painel admin completo

### P1 - Importante
- [ ] Notificações por email (anúncio aprovado/rejeitado)
- [ ] Recuperação de senha
- [ ] Dashboard do vendedor com analytics

### P2 - Melhorias
- [ ] Sistema de favoritos
- [ ] Comparador de máquinas
- [ ] Chat interno
- [ ] Histórico de preços

### P3 - Futuro
- [ ] App mobile (React Native)
- [ ] Integração com financiamento
- [ ] Sistema de avaliações
