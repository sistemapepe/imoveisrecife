# Plano de Ação: Finalização do Módulo Network Admin

Este plano detalha as etapas para implementar as funcionalidades pendentes no módulo de Administração de Rede (Network Admin), garantindo o gerenciamento global de temas e limites de recursos para a arquitetura multi-tenant.

## Alterações Técnicas

### Banco de Dados (Supabase)
- Criar tabela `global_settings` para armazenar configurações de rede (temas globais, limites de recursos).
- Habilitar RLS e políticas de acesso restritas a `super_admin`.

### Frontend (React)
- **Implementação da aba "Configurações":**
    - Criar componente `NetworkSettingsTab.tsx`.
    - Adicionar gerenciamento de temas globais (paleta de cores padrão para novos sites).
    - Adicionar controle de limites de recursos (ex: limite de imóveis por site, limite de usuários).
- **Refinamento do Dashboard de Rede:**
    - Adicionar estatísticas agregadas (total de sites ativos, total de imóveis na rede, usuários ativos).
- **Otimização de Navegação:**
    - Garantir que a transição entre Admin de Site e Network Admin seja fluida.

## Experiência do Usuário (UX)
- Interface de configurações seguindo o design de "luxury dark" com acentos dourados.
- Feedback em tempo real ao alterar limites de recursos.
- Validações claras para evitar configurações conflitantes na rede.

## Segurança
- Garantir que apenas usuários com a role `super_admin` possam acessar e modificar a `global_settings`.
- Auditoria de alterações em configurações globais.
