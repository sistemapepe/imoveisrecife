# Plano de Otimização de Performance - Network Admin

O objetivo é resolver a lentidão relatada no painel de rede (/network-admin) através de cache, pré-carregamento e otimização de consultas ao banco de dados.

## Alterações Propostas

### 1. Otimização de Navegação e Prefetch
- **Arquivo**: `src/pages/NetworkAdmin.tsx`
- **Ação**: Implementar lógica de `prefetch` ao passar o mouse sobre os itens do menu. Isso carregará os componentes `lazy` e iniciará as buscas de dados antes mesmo do clique.
- **Ação**: Otimizar o `useTransition` para garantir que a interface não pareça travada durante a troca de abas.

### 2. Cache e Otimização do Dashboard
- **Arquivo**: `src/components/admin/NetworkDashboard.tsx`
- **Ação**: Implementar cache em `sessionStorage` (30-60 segundos) para as estatísticas globais.
- **Ação**: Substituir contagens manuais por buscas leves (`head: true`) para evitar transferência desnecessária de dados.

### 3. Refatoração de Performance do Analytics
- **Arquivo**: `src/components/admin/AnalyticsTab.tsx`
- **Ação**: Quando `isNetwork` for verdadeiro, utilizar consultas agregadas ou limitar drasticamente o volume de dados retornados.
- **Ação**: Cachear resultados de analytics por período para evitar refetching ao alternar abas e voltar.

### 4. Otimização do Gerenciador de Usuários e Sites
- **Arquivo**: `src/components/admin/UsersTab.tsx` e `src/components/admin/SitesTab.tsx`
- **Ação**: Garantir que as listas globais utilizem cache local e skeletons de carregamento mais eficientes.
- **Ação**: Adicionar suporte a paginação ou carregamento incremental para redes com muitos sites/usuários.

## Detalhes Técnicos
- **Caching**: Utilizar `localStorage`/`sessionStorage` com TTL (Time To Live).
- **Prefetch**: Inserir gatilhos `onMouseEnter` nos botões de navegação para disparar o `import()` dinâmico do React Lazy.
- **Agregação SQL**: Minimizar o processamento de grandes arrays no JavaScript, delegando contagens ao PostgreSQL via Supabase.
