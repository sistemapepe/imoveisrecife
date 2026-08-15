# Plano: Separação do Módulo de Sites (Network Admin)

Este plano descreve a reestruturação técnica para remover o gerenciamento de múltiplos sites (tenants) do painel administrativo comum e centralizá-lo em uma interface exclusiva para o Super Admin.

## Objetivos
- Remover a aba "Sites" do `Admin.tsx`.
- Criar uma rota dedicada `/network-admin` protegida para Super Admins.
- Implementar um layout de navegação independente para a gestão da rede de sites.
- Garantir que a operação do dia a dia da imobiliária seja isolada da gestão da infraestrutura.

## Etapas Técnicas

### 1. Criação da Rota e Layout
- Criar `src/pages/NetworkAdmin.tsx`: Página principal da gestão de rede.
- Criar `src/components/NetworkAdminLayout.tsx`: Sidebar e header específicos para a rede.
- Adicionar a nova rota no `App.tsx` com proteção de `isSuperAdmin`.

### 2. Migração de Componentes
- Mover a lógica de `SitesTab.tsx` para o novo contexto de rede.
- Criar abas específicas para a rede:
    - **Dashboard da Rede**: Visão global de todos os sites.
    - **Gerenciador de Sites**: Lista, criação (duplicação) e edição de domínios.
    - **Usuários Globais**: Gestão de Super Admins.
    - **Segurança da Rede**: Diagnósticos globais.

### 3. Limpeza do Painel Admin Comum
- Remover o item "Sites" e a importação do `SitesTab` no arquivo `src/pages/Admin.tsx`.
- Ajustar as permissões para que o módulo de sites não seja mais carregado no contexto da imobiliária individual.

### 4. Experiência do Usuário (UX)
- Adicionar um link de atalho na sidebar do Super Admin no painel comum para "Gestão de Rede".
- Garantir que o redirecionamento entre o painel de rede e o painel de site individual funcione perfeitamente via `site_id`.

## Detalhes Técnicos
- O novo painel utilizará os mesmos temas e componentes base (shadcn/ui, Framer Motion) para manter a consistência visual.
- A segurança continuará baseada nas políticas de RLS do banco de dados, onde apenas o papel `super_admin` tem acesso à tabela `sites`.
