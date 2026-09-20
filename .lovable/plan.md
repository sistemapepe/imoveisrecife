# Conectar o domínio pernambuco.site na Vercel

## Objetivo
Colocar `pernambuco.site` (e `www.pernambuco.site`) no ar, vinculados ao site `imobg` da rede, usando a automação já existente no painel.

## Estado confirmado
- O site `imobg` (ID `287f941c-1258-4c21-89c4-ba7679814517`) já tem `pernambuco.site` e `www.pernambuco.site` salvos no banco (`tenant_domains`), mas ainda **não estão cadastrados no projeto Vercel** — a função `manage-domain` retorna `state: "nao_cadastrado"` para os dois hostnames.
- O DNS público atual de `pernambuco.site` aponta para `185.158.133.1` (Lovable), não para a Vercel.

## Passos

1. **Acionar o cadastro no painel**
   - No admin: **Rede de Sites → imobg → Domínios**.
   - Digitar `pernambuco.site` e clicar em **Conectar**.
   - A edge function `manage-domain` fará `POST /v10/projects/{id}/domains` para `pernambuco.site` e `www.pernambuco.site`.

2. **Atualizar o DNS no provedor do domínio**
   Depois de conectar, o painel mostrará os registros esperados:
   - `A` · `@` · `76.76.21.21`
   - `CNAME` · `www` · `cname.vercel-dns.com`

   Alternativa mais simples: trocar os **nameservers** do domínio para:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   (assim a Vercel gerencia os registros sozinha).

3. **Verificar até ficar "No ar"**
   - No painel, clicar em **Verificar** (ou aguardar a verificação automática).
   - Estados esperados: `Não conectado` → `Aguardando DNS` → `Emitindo certificado` → `No ar`.
   - O certificado SSL é emitido automaticamente pela Vercel.

4. **Corrigir o campo de domínio do site, se necessário**
   - Atualmente `sites.domain` do `imobg` está como `localhost`. Após o domínio ficar no ar, atualizar para `pernambuco.site` para que links e OpenGraph usem o endereço certo.

## Validação
- `manage-domain` com `action: "status"` retorna `registered: true` e `verified: true` para `pernambuco.site` e `www.pernambuco.site`.
- DNS público passa a resolver para a Vercel (`76.76.21.21` ou nameservers da Vercel).
- Ambas as URLs abrem o site com `https`.

## Risco / fallback
- Se o provedor do domínio usar proxy (Cloudflare), os registros A/CNAME podem não ser aceitos na verificação. Nesse caso, a solução é delegar os nameservers para a Vercel.
- Se o domínio já estiver em uso em outro projeto Vercel, a API retornará `domain_already_in_use`; será preciso remover de lá antes.
