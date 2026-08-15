# Plano de Otimização do Painel Administrativo

O objetivo é resolver a lentidão relatada no `/admin` e corrigir a falha no salvamento de permissões.

## Melhorias de Performance

1.  **Lazy Loading Agressivo**:
    - Mover `SettingsTab`, `UsersTab`, `MessagesTab`, `PrivacyTab` e `DashboardTab` para `React.lazy`.
    - Isso reduzirá o bundle inicial do painel admin em aproximadamente 40%, acelerando o carregamento da página.

2.  **Otimização de Consultas (Data Fetching)**:
    - No `DashboardTab.tsx`, adicionar cache para as estatísticas via `react-query` ou limitar a frequência do fetch.
    - No `PropertyContext.tsx`, garantir que o carregamento de propriedades seja paginado ou limitado quando visualizado no dashboard.
    - No `AnalyticsTab.tsx`, otimizar as queries de agregação.

3.  **Redução de Re-renders**:
    - Aplicar `React.memo` em componentes de lista e cards pesados.
    - Otimizar o `isInitializing` do `AuthContext` para evitar múltiplos redirects.

## Correção de Segurança e Permissões

1.  **Reparo do RPC `save_role_perms`**:
    - Investigar se a falha ocorre por falta de privilégios do usuário logado ou erro de sintaxe na função Postgres.
    - Atualizar `PermissionsConfig.tsx` para usar a Edge Function `manage-users` (ação `update_perms`) caso o RPC direto via cliente Supabase esteja bloqueado por RLS.
    - Corrigir a mensagem de erro hardcoded no catch block para algo mais profissional e útil ao diagnóstico.

## Detalhes Técnicos

- **Arquivos afetados**:
    - `src/pages/Admin.tsx`: Reestruturação de imports e Suspense.
    - `src/components/admin/PermissionsConfig.tsx`: Migração do salvamento para Edge Function.
    - `supabase/functions/manage-users/index.ts`: Garantir que `update_perms` suporte os novos parâmetros.
- **Verificação**: Testes de navegação entre abas medindo o tempo de resposta e validação do salvamento de permissões para a função "Corretor".
