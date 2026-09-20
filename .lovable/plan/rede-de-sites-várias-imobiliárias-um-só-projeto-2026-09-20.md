# Rede de Sites: várias imobiliárias, um só projeto

Em vez de copiar o projeto várias vezes (cada cópia teria que ser atualizada à mão), o mesmo sistema passa a atender vários sites. Cada site tem seu próprio domínio, sua marca, seus imóveis e sua equipe — e toda melhoria que fizermos aparece automaticamente em todos.

## Como vai funcionar

- O visitante entra por um domínio (ex.: `imobiliariaA.com.br`) e o sistema identifica qual site é, carregando logo, cores, contatos e imóveis daquela imobiliária.
- Os dados ficam totalmente separados: uma imobiliária nunca vê imóveis, mensagens ou usuários de outra.
- Cada equipe entra no mesmo endereço de login e cai direto no painel do seu site.
- Só o Super Admin enxerga o painel da rede inteira.

## Novo módulo "Rede de Sites" (apenas Super Admin)

- Lista de todos os sites com marca, domínio, status e número de imóveis.
- Criar um site novo em um passo (nome, domínio, administrador responsável), opcionalmente copiando as configurações visuais de um site existente como ponto de partida.
- Ativar/desativar um site, trocar domínio, entrar no painel de qualquer site para dar suporte.
- Visão consolidada: total de imóveis, visitas e mensagens por site.

## O que já existe e o que falta

Já existe no banco a estrutura de sites, domínios e a marcação de "a qual site pertence" em imóveis, configurações, mensagens, permissões e registros de acesso. Falta:

1. Identificar o site pelo endereço acessado e usar isso em todas as telas públicas.
2. Amarrar cada usuário do painel ao seu site e filtrar tudo no admin por esse site.
3. Reforçar as regras de isolamento no banco para que nada vaze entre sites.
4. Criar o módulo Rede de Sites.
5. Ajustar mapa do site, SEO e compartilhamento em redes sociais para usarem o domínio correto de cada site.

## Detalhes técnicos

- Resolução de tenant: `TenantContext` no cliente resolve `window.location.hostname` contra `tenant_domains` / `sites.domain`, com fallback para o site padrão no domínio Lovable e cache em `sessionStorage`.
- Todas as leituras públicas (`PropertyContext`, busca, detalhe, coleções) e do admin passam a filtrar por `site_id`; inserções gravam `site_id` do tenant ativo.
- RLS: políticas por `site_id` usando as funções em `internal` (`has_role` já é site-aware); Super Admin faz bypass. Grants revistos para `anon`/`authenticated`.
- Edge functions (`sitemap`, `get-contact-info`, `seo-generate`, `update-seo`, `manage-users`) recebem/derivam `site_id` a partir do host da requisição.
- Domínios: cada domínio é conectado ao mesmo projeto publicado nas configurações de domínio; o código só precisa reconhecer o hostname.
- Testes: cenários de isolamento (usuário do site A não lê dados do site B) e smoke E2E por hostname.

## Esforço e créditos

Estimativa: entre 15 e 25 mensagens de implementação, divididas assim:

- Resolução por domínio e front público multi-site: 4-6
- Admin filtrado por site + vínculo de usuários: 4-6
- Módulo Rede de Sites: 3-5
- RLS, edge functions, SEO/sitemap por domínio: 3-5
- Testes e ajustes finais: 2-3

O consumo real depende de quantos ajustes visuais surgirem no caminho. Dá para fazer por etapas: a etapa 1 já entrega um segundo site rodando em domínio próprio.
