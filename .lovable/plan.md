# Corrigir quais imóveis aparecem no site

## O que está acontecendo hoje

Verifiquei os 15 imóveis cadastrados: 13 estão como "disponível" e 2 como "vendido".

- O carrossel do topo (hero) monta os slides com **todos** os imóveis, sem olhar o status. Por isso os 2 imóveis vendidos aparecem lá.
- Os blocos de "coleções" por tipo também contam todos os imóveis, incluindo vendidos, então os números ficam maiores que a realidade.
- Na página de resultados da busca, nenhum filtro de status é aplicado por padrão: os vendidos entram na lista.
- Na página inicial, a lista de imóveis mostra só os 6 primeiros até a pessoa clicar em "Ver todos" — dá a impressão de que imóveis ativos sumiram.
- Um imóvel marcado como "reservado" hoje é escondido da home junto com os vendidos, mesmo ainda sendo um anúncio ativo.

## O que vou fazer

1. Criar uma regra única de "imóvel visível no site": disponível e reservado aparecem; vendido não aparece em nenhuma listagem pública.
2. Aplicar essa regra em todos os lugares: carrossel do topo, coleções por tipo, lista da página inicial, resultados de busca e imóveis semelhantes.
3. Imóveis reservados continuam visíveis, com a tarja "Reservado" já existente.
4. Na página inicial, exibir todos os imóveis ativos com o botão "Ver mais" carregando o restante, em vez de esconder imóveis sem aviso.
5. Na busca, deixar o filtro de status funcionando só entre os ativos (disponível/reservado), sem trazer vendidos.
6. Página de um imóvel vendido acessada por link direto continua abrindo, mas com aviso de indisponível e sem entrar nos resultados/indexação.
7. Conferir no navegador, com o site rodando, que o carrossel e as listas mostram exatamente os 13 ativos e nenhum vendido.

## Detalhes técnicos

- Novo utilitário `isPubliclyVisible(property)` em `src/lib/property-visibility.ts` (status `disponivel` ou `reservado`), exportado junto de um helper `getVisibleProperties(list)`.
- `src/pages/Index.tsx`: `heroSlides` e `collections` passam a usar `available` (renomeado para `visibleProperties`), removendo o comentário "show ALL properties"; paginação incremental em vez de corte fixo em 6.
- `src/pages/SearchResults.tsx`: base do `filtered` passa por `getVisibleProperties`; chips de status limitados a disponível/reservado.
- `src/components/SimilarProperties.tsx`: troca o `p.status === "vendido"` manual pelo helper.
- `src/pages/PropertyDetail.tsx`: adiciona `noindex` e aviso quando o status não é público.
- Sem mudanças no banco; o status continua sendo controlado no painel.
