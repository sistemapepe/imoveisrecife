# Plano de Implementação: Otimização Multi-tenant e DNS

Este plano visa robustecer a arquitetura multi-tenant, garantindo que o sistema identifique corretamente cada site pelo domínio, valide configurações no painel e ofereça segurança contra acessos a domínios não mapeados.

## 1. Refinamento do SiteContext (Resolução de Domínio)
O `SiteContext` será atualizado para ser mais rigoroso na identificação do site, tratando variações de `www` e garantindo que o fallback não carregue dados de outro cliente indevidamente.

- Normalizar `window.location.hostname` removendo `www.` para busca no banco.
- Priorizar o `site_id` na URL apenas para administradores autenticados (evitando spoofing).
- Melhorar a lógica de cache para evitar colisões entre sites diferentes no mesmo navegador.

## 2. Validação de Domínios no Painel Admin
Melhorar a aba "Gerenciar Sites" para evitar erros comuns de configuração de DNS.

- Adicionar regex de validação de formato de domínio (ex: `site.com.br`).
- Bloquear a criação de domínios duplicados (validação client-side e tratamento de erro de constraint do banco).
- Adicionar um aviso visual sobre a necessidade de apontamento CNAME/A no DNS do provedor.

## 3. Página de Fallback (Domínio Não Configurado)
Implementar uma página amigável para quando um domínio aponta para o IP do servidor mas não está cadastrado no sistema.

- Criar o componente `SiteNotFound` ou redirecionar para uma rota de erro específica.
- Impedir o carregamento da Home/Imóveis se o site não for resolvido com sucesso.

## 4. Pré-visualização de Domínio no Admin
Permitir que o administrador visualize como o site ficará antes mesmo da propagação do DNS.

- Adicionar um botão "Simular Visão do Cliente" que abre o site em uma nova aba com o `site_id` forçado.
- Garantir que o `DynamicTheme` e `PropertyContext` respeitem esse `site_id` em tempo real.

## Detalhes Técnicos
- **Localização**: `src/contexts/SiteContext.tsx`, `src/components/admin/SitesTab.tsx`, `src/App.tsx`.
- **Fluxo**:
  1. O usuário digita o domínio no navegador.
  2. `SiteProvider` busca por `domain` ou `www.domain`.
  3. Se encontrado, injeta as configurações no app.
  4. Se não encontrado, exibe tela de "Site em Manutenção/Não Configurado".
