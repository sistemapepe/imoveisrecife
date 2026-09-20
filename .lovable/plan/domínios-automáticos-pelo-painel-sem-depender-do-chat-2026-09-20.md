# Domínios automáticos pelo painel (sem depender do chat)

Objetivo: você adiciona o endereço do cliente dentro da Rede de Sites e o próprio sistema cadastra o domínio na hospedagem, mostra o que colocar no DNS e confirma sozinho quando estiver no ar — com certificado https automático. Nada mais pelo chat.

## Como vai funcionar na prática

1. Em **Rede de Sites → Domínios**, você digita `minhaimobiliaria.com.br` e clica em Conectar.
2. O sistema cadastra o endereço na hospedagem (Vercel) e grava no banco, ligado ao site do cliente.
3. A tela mostra, já pronta para copiar, exatamente os registros que o cliente precisa colar no painel do provedor dele (funciona com qualquer provedor: Registro.br, GoDaddy, Hostinger, Cloudflare etc.).
4. Um botão **Verificar** (e uma checagem automática a cada poucos segundos enquanto a tela está aberta) mostra o semáforo: Aguardando DNS → Emitindo certificado → No ar.
5. Também dá para remover o domínio pelo painel, o que apaga na hospedagem e no banco.

## O que você precisa fazer uma única vez

Gerar um token de acesso da sua conta Vercel:

1. Entre em vercel.com e clique na sua foto (canto superior direito) → **Account Settings**.
2. Menu lateral → **Tokens** → **Create Token**.
3. Nome: `lovable-dominios`. Escopo: selecione o time/conta onde está o projeto. Validade: **No Expiration**.
4. Copie o valor mostrado (só aparece uma vez).

Depois eu abro um formulário seguro para você colar três coisas:
- `VERCEL_TOKEN` — o token acima
- `VERCEL_PROJECT_ID` — em Vercel → seu projeto → Settings → General → Project ID
- `VERCEL_TEAM_ID` — em Vercel → Settings do time → Team ID (deixe em branco se a conta for pessoal)

Nada disso fica visível no código nem no navegador: só o servidor usa.

## Detalhes técnicos

- Nova função de servidor `manage-domain` com ações `add`, `status`, `remove`.
  - `add`: valida o hostname, chama `POST /v10/projects/{id}/domains` para o host e para a variante `www`, e em seguida grava via RPC existente `network_add_domain` (host + www) no `tenant_domains`/`tenants`, atualizando `sites.domain`.
  - `status`: `GET /v9/projects/{id}/domains/{host}/config` + `/verify`, devolvendo `misconfigured`, registros esperados (A/CNAME e eventual TXT de verificação) e se o certificado já saiu.
  - `remove`: `DELETE /v9/projects/{id}/domains/{host}` (host e www) + RPC `network_remove_domain`.
  - Autorização em código: exige JWT válido e `internal.has_role(uid,'admin', site_id)` ou super admin; registra em `audit_logs`. Rate limit simples por usuário.
- Front: o diálogo "Domínios" do `NetworkTab.tsx` ganha campo de conexão, lista de hostnames com estado (badge colorida), botões Copiar registro, Verificar e Remover, e polling enquanto aberto.
- Sem mudanças de schema: reaproveita `tenant_domains`, `tenants`, `sites.domain` e as RPCs já criadas.
- Fallback: se o token não estiver configurado, a tela avisa e mantém o comportamento atual (apenas cadastro do endereço no banco).

## Limitação honesta

O DNS em si é do provedor do cliente. Como cada cliente usa um provedor diferente, o sistema não pode gravar o registro por eles — mas entrega o valor exato para colar e confirma sozinho assim que propagar. Se no futuro você padronizar clientes na Cloudflare, dá para automatizar também esse último passo.
