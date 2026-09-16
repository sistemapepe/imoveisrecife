# Botão de download das fotos com marca d'água

## O que será feito

Na página de cada imóvel, um botão **"Baixar fotos"** aparece somente quando um administrador está logado. Visitantes e usuários sem permissão não veem o botão.

Ao clicar:
- Todas as fotos do imóvel são baixadas já com a marca d'água aplicada, igual ao que aparece no site: mesma logo, mesma posição, mesmo tamanho e mesma opacidade definidos nas configurações.
- Se a marca d'água estiver desligada nas configurações, as fotos baixam sem ela.
- Com mais de uma foto, tudo vem em um único arquivo compactado (.zip) com o nome do código do imóvel, por exemplo `IMO-0007-fotos.zip`, e as fotos numeradas na mesma ordem da galeria.
- Com uma única foto, o download é direto da imagem.
- Enquanto prepara, o botão mostra o progresso ("Preparando 3/12...") e avisa ao terminar.

## Onde aparece

- Página de detalhe do imóvel (topo da galeria), discreto, no estilo visual atual do site.
- Também na listagem do painel administrativo, como ação de cada imóvel, para baixar sem precisar abrir a página pública.

## Detalhes técnicos

- Novo utilitário `src/lib/download-watermarked.ts`: carrega a imagem original em resolução cheia, desenha em `<canvas>` e sobrepõe a logo usando os mesmos parâmetros de `Watermark.tsx` (`watermarkEnabled`, `watermarkPosition`, `watermarkOpacity`, `watermarkSizePct`), exportando em JPEG de alta qualidade.
- Fotos e logo vindas do bucket `property-images` são buscadas com `crossOrigin="anonymous"` para não contaminar o canvas; o bucket já é público.
- Empacotamento com `jszip` (dependência nova, leve) e carregamento sob demanda para não pesar o bundle inicial.
- Novo componente `src/components/DownloadPhotosButton.tsx`, renderizado em `PropertyDetail.tsx` e na aba de imóveis do painel, protegido por `isAdmin || canManageProperties` do `AuthContext` (visibilidade de interface; as imagens em si já são públicas hoje).

## Fora deste escopo

A estrutura de vários domínios (rede de sites) fica para depois, conforme sua escolha.
