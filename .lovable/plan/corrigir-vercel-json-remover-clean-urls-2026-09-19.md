# Corrigir `vercel.json`: remover `clean_urls`

## Objetivo
Eliminar o erro de publicação na Vercel causado pela propriedade `clean_urls`, que não é permitida no esquema do `vercel.json`.

## Alteração
Remover a linha `"clean_urls": true` do arquivo `vercel.json`.

## Por que isso resolve
A Vercel valida o `vercel.json` contra seu esquema e rejeita propriedades não reconhecidas. A funcionalidade de "URLs limpas" (sem `.html`) já é o comportamento padrão para SPAs com rewrites, então a propriedade é redundante.

## Verificação
Após a remoção, o arquivo continuará com:
- `framework: vite`
- `rewrites` para SPA fallback
- `headers` de segurança (CSP, HSTS, etc.)

A configuração resultante será publicável sem erros de esquema.
