# Plano de Implementação Multi-tenant (Multi-domínio)

O objetivo é transformar a aplicação atual em uma plataforma multi-tenant, onde múltiplos domínios (sites de diferentes profissionais) rodam sobre o mesmo código e banco de dados, mantendo o isolamento de dados e permitindo que o `super_admin` gerencie tudo centralmente.

## Mudanças Técnicas

### 1. Banco de Dados (Supabase)
- **Nova Tabela `sites`**: Armazenará os domínios, nomes das marcas e o dono (owner) de cada instância.
- **Coluna `site_id`**: Será adicionada às tabelas `properties`, `site_settings`, `contact_messages`, `visits` e `performance_logs`.
- **Políticas RLS**: Atualização das políticas para garantir que usuários comuns vejam apenas dados do seu `site_id`, enquanto o `super_admin` tem acesso global.

### 2. Frontend (React)
- **Contexto de Domínio (`SiteContext`)**: Criar um novo contexto que detecta o domínio atual (`window.location.hostname`) e busca o `site_id` correspondente.
- **Hook `useSite`**: Para acessar as configurações e o ID do site atual em qualquer componente.
- **Intercepção de Consultas**: Garantir que o `supabase.from().select()` inclua o filtro `.eq('site_id', siteId)` em todos os lugares necessários.
- **Painel Administrativo**:
    - Adicionar aba "Sites" para o `super_admin` criar e gerenciar novos domínios.
    - Adaptar o gerenciamento de usuários para vincular novos usuários ao `site_id` correto.

### 3. Segurança e Isolamento
- Implementação de um gatilho (Trigger) no banco de dados para garantir que novos registros sempre recebam o `site_id` correto baseado no usuário ou sessão atual.

## Detalhes para o Usuário
- O projeto atual será migrado para ser o "Site Padrão" vinculado ao domínio atual.
- Nenhum dado será perdido; as tabelas serão apenas estendidas.
- O `super_admin` poderá criar uma "Cópia" simplesmente adicionando um novo domínio na tabela de sites e convidando um profissional.
