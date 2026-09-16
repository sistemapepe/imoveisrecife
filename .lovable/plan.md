# Rede de Sites: um sistema, vários domínios

## Objetivo

Em vez de copiar o projeto várias vezes, o mesmo sistema passa a atender vários domínios. Cada imobiliária tem o próprio domínio, logo, cores, imóveis, contatos e equipe — totalmente separados. Quando eu atualizar o sistema, a melhoria aparece em todos os sites no mesmo instante, sem retrabalho.

## O que já existe hoje

- O banco já tem a estrutura de sites (tabela de sites, marcador de site em imóveis, configurações, equipe, contatos, visitas, tráfego e importações).
- Já existe uma rotina no banco que duplica as configurações e as permissões de um site para um novo.
- Já existem 3 sites cadastrados, mas **o site público ainda ignora tudo isso**: ele sempre carrega a primeira configuração encontrada e mostra todos os imóveis, sem olhar o domínio de acesso.

## O que será feito

### 1. Reconhecimento do site pelo domínio
O site passa a identificar por qual endereço o visitante entrou e carrega apenas a marca, as cores, a logo, os textos e os imóveis daquela imobiliária. Endereço não cadastrado cai em um site padrão definido por você.

### 2. Separação real dos dados
Todas as telas públicas e do painel passam a filtrar por site: imóveis, busca, favoritos, contatos, mensagens, visitas, tráfego, analytics, importação em massa e histórico. Tudo o que for criado já nasce marcado com o site correto.

### 3. Módulo "Rede de Sites" (somente Super Admin)
Nova área no painel, visível apenas para o Super Admin, com:
- Lista de todos os sites: marca, domínio, situação (ativo/inativo), nº de imóveis, últimos acessos.
- Botão "Criar novo site", com opção de começar do zero ou copiar as configurações de um site existente (logo, cores, textos, permissões).
- Cadastro do domínio de cada site e indicação do que falta configurar.
- Definição do administrador responsável por cada site.
- Ativar/desativar um site e visão consolidada da rede (total de imóveis, leads e visitas por site).

### 4. Troca de contexto para o Super Admin
O Super Admin escolhe no topo do painel qual site quer administrar; administradores e corretores enxergam apenas o próprio site, sempre.

### 5. Regras de segurança
Revisão das regras de acesso do banco para garantir que nenhum site consiga ler ou alterar dados de outro, incluindo códigos de imóvel e imagens, que passam a ser sequenciais por site.

### 6. SEO e compartilhamento por site
Título, descrição, ícone da aba, imagem de compartilhamento, robots e sitemap passam a ser gerados conforme o domínio acessado.

### 7. Download das fotos com marca d'água (somente administrador logado)
Na página do imóvel, um botão "Baixar fotos" aparece **apenas para o administrador logado** (invisível para visitantes). Ao clicar, todas as imagens daquele imóvel são baixadas já com a marca d'água aplicada, exatamente como aparecem no site (mesma logo, posição, tamanho e opacidade configurados). Várias fotos vêm em um único arquivo .zip nomeado pelo código do imóvel; uma única foto baixa direto como imagem.


## Como ficam os domínios

Cada imobiliária aponta o domínio dela para este mesmo projeto (Configurações do Projeto > Domínios). Detalhe importante: é preciso deixar **nenhum domínio marcado como principal**, senão o sistema redireciona todos para um só endereço. Depois de conectado, você cadastra o domínio no módulo Rede de Sites e ele já responde com a marca certa.

## Detalhes técnicos

- Resolução de tenant por `window.location.hostname` em um `SiteContext`, com consulta à tabela `sites` (e `tenant_domains` para apelidos/subdomínios), cache em React Query e fallback para site padrão.
- `PropertyContext` deixa de usar `site_settings ... limit(1)` e passa a usar `.eq('site_id', siteId)`; todos os hooks de leitura recebem `site_id` na query key.
- Funções do banco a ajustar: `generate_property_code` (prefixo e sequência por `site_id`), `save_role_perms` (conflito por `role, permission, site_id`), `duplicate_site` (reaproveitada pelo módulo).
- Políticas RLS reescritas com `has_role(auth.uid(), role, site_id)`; `site_id` obrigatório (NOT NULL + default via contexto) nas tabelas de dados.
- Edge functions `sitemap`, `get-contact-info`, `seo-generate`, `update-seo` e `manage-users` passam a receber/derivar `site_id` do host.
- Nova tela `src/components/admin/NetworkTab.tsx` + rota no `Admin.tsx`, restrita a `isSuperAdmin`.
- Download com marca d'água: utilitário que compõe imagem + logo em `<canvas>` reusando os parâmetros de `Watermark.tsx` (`watermark_position/opacity/size_pct`), exporta em JPEG e empacota com JSZip; botão renderizado em `PropertyDetail.tsx` sob `isAdmin || canManageProperties`.


## Estimativa de créditos

Não existe preço fixo por funcionalidade: o consumo é por mensagem de trabalho, e varia com o tamanho das alterações. Pela extensão do que está acima, a estimativa realista é:

| Etapa | Mensagens estimadas |
|---|---|
| Reconhecimento por domínio + contexto de site | 2 a 3 |
| Separação dos dados em todas as telas | 4 a 6 |
| Módulo Rede de Sites | 3 a 5 |
| Segurança (RLS) e funções do banco | 2 a 4 |
| SEO/sitemap por domínio + testes e ajustes | 3 a 5 |
| **Total** | **14 a 23 mensagens** |

Comparativo: manter cópias separadas do projeto custaria esse mesmo esforço **multiplicado por cada cliente**, toda vez que houvesse uma atualização. Posso executar por etapas, e você acompanha o consumo em Configurações > Uso/Créditos a cada fase.

## Sugestão de ordem

Começar pelas etapas 1, 2 e 5 (o sistema já passa a funcionar corretamente por domínio e com dados isolados) e, na sequência, o módulo Rede de Sites e o SEO por domínio.
