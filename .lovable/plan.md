# Domínio Próprio: tela guiada de configuração

Hoje, na Rede de Sites, o botão "Domínios" apenas cadastra o endereço no banco (isso diz ao sistema qual imobiliária abrir naquele endereço). Ele não cria o apontamento de DNS nem coloca o endereço no ar. Falta a parte que o usuário mais precisa: saber exatamente o que preencher no provedor do domínio e conferir se já funcionou.

Este plano cria uma tela "Domínio Próprio" totalmente configurável pelo usuário, dentro de Configurações do site, com passo a passo, registros prontos para copiar e verificação automática de status.

## Como vai funcionar para o usuário

1. Em **Configurações > Domínio Próprio**, o usuário digita o endereço (ex.: `www.imobiliariaboaviagem.com.br`) e clica em Salvar.
2. A tela mostra os registros exatos a criar no provedor do domínio, cada um com botão de copiar:
   - Tipo A, nome `@`, valor `185.158.133.1`
   - Tipo A, nome `www`, valor `185.158.133.1`
   - Tipo TXT, nome `_lovable`, com o código de verificação
3. Botão **Verificar agora**: o sistema consulta o DNS público e responde em linguagem simples — "ainda não propagou", "apontando corretamente", "apontando para outro lugar".
4. Um semáforo de etapas mostra onde o domínio está: Cadastrado → DNS apontado → Publicado → No ar.
5. Instruções curtas por provedor (Registro.br, GoDaddy, Hostinger, Cloudflare), incluindo o aviso de desligar o "proxy laranja" na Cloudflare.
6. Ao salvar, o endereço é vinculado automaticamente ao site atual na rede (e a variante `www`/sem `www` também), sem o usuário precisar abrir a aba Rede de Sites.

## O que é automatizável e o que não é

Automatizável: cadastro do endereço, vínculo com a imobiliária, geração dos registros corretos, verificação do DNS e diagnóstico do que está errado.

Não automatizável de dentro do site: criar os registros dentro do provedor do domínio (só o dono da conta do registrador pode) e a ativação final do certificado, que acontece nas configurações de publicação do projeto. A tela vai deixar esses dois passos explícitos, com link e checklist, em vez de deixar o usuário perdido.

## Detalhes técnicos

- Nova aba `DomainTab.tsx` em `src/components/admin/`, registrada em `src/pages/Admin.tsx` junto às demais abas de configuração, restrita por `canManageSettings`/`isAdmin`.
- Persistência: reutiliza `tenant_domains` (hostname, tenant_id, is_primary, status) via as RPCs já existentes `network_add_domain` / `network_remove_domain`. Como essas RPCs exigem super admin, será adicionada uma RPC `site_set_custom_domain(p_site_id, p_hostname)` com `security definer`, que autoriza admin do próprio site (`internal.has_role(auth.uid(),'admin', p_site_id)`) ou super admin, normaliza o hostname (remove protocolo, porta e caminho), grava host e variante `www`, e registra em `audit_logs`.
- Verificação de DNS: nova edge function `check-domain-dns` que consulta DNS-over-HTTPS (`https://dns.google/resolve`) para registros A do host e TXT de `_lovable`, compara com `185.158.133.1` e devolve um veredito por registro (`ok`, `ausente`, `apontando_para_outro`, `propagando`). Sem segredos; CORS liberado; rate limit simples em memória.
- Estado do domínio exibido combinando: linha em `tenant_domains` + resultado do DNS + se o hostname resolvido pelo `TenantContext` já bate com o site.
- Textos e valores de IP/registros ficam em uma constante única no front, para atualização em um só lugar.
- Rede de Sites: o diálogo "Domínios" passa a exibir o mesmo semáforo de status por hostname, reaproveitando a função de verificação.

## Entrega

Ao final, qualquer administrador de um site da rede consegue, sozinho, cadastrar seu domínio, copiar os registros, conferir se o apontamento está correto e saber exatamente qual é o último passo que depende da publicação do projeto.
