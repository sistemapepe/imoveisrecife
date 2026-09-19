# Corrigir definitivamente a publicação na Vercel

## Diagnóstico confirmado
- O `vercel.json` atual não contém `clean_urls` e está com JSON válido.
- Existe apenas um `vercel.json` no projeto.
- A única referência restante a `clean_urls` está em um relatório interno antigo, que não é configuração de publicação.
- Portanto, a mensagem da Vercel está vindo de uma revisão anterior ou de outra origem/pasta configurada para a implantação manual.

## Implementação
1. Recriar o `vercel.json` em uma nova revisão, preservando as regras atuais de navegação e segurança, sem `clean_urls`.
2. Validar localmente o JSON e procurar novamente a propriedade inválida em todos os arquivos que podem entrar na publicação.
3. Conferir o pacote de origem usado na implantação para garantir que ele contém a versão nova do arquivo.
4. Gerar uma nova publicação, em vez de tentar reimplantar a implantação antiga.
5. Confirmar no resultado da nova implantação que a validação do esquema passou e que páginas de imóveis continuam abrindo diretamente.

## Observação para a publicação manual
A nova implantação precisa usar a revisão gerada após esta correção. Reimplantar uma revisão antiga continuará enviando o `vercel.json` antigo, mesmo que o arquivo já esteja corrigido no projeto atual.
