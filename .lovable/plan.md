# Simplificar domínios: sem tela de DNS

## O que muda

Você já tem seus domínios comprados. Em vez de uma tela técnica com registros para copiar, o processo fica assim: você me diz o endereço (ex.: `minhaimobiliaria.com.br`) e eu abro o assistente de conexão da própria plataforma, que configura tudo com a sua confirmação. No painel, os domínios continuam apenas listados na aba Rede de Sites, como antes.

## Alterações

1. **Remover a aba "Domínio Próprio"** das Configurações do site:
   - Excluir `src/components/admin/DomainTab.tsx`.
   - Remover a aba e o registro dela em `src/pages/Admin.tsx`.

2. **Simplificar a Rede de Sites** (`src/components/admin/NetworkTab.tsx`):
   - O diálogo "Domínios" volta a ser só uma lista de endereços vinculados ao site, com botão para adicionar/remover — sem semáforo, sem registros DNS, sem "Verificar agora".
   - Adicionar um texto curto orientando: "Depois de adicionar o endereço aqui, peça no chat para conectar o domínio — a configuração é guiada e automática."

3. **Limpeza de apoio**:
   - Remover `src/lib/domain-dns.ts` e a função de verificação de DNS (`check-domain-dns`), que deixam de ser usadas.
   - Manter no banco a gravação de domínios por site (nada muda nos dados já salvos).

4. **Fluxo de conexão (a partir de agora)**: quando você quiser colocar um domínio no ar, basta me enviar o endereço no chat. Eu abro o cartão de conexão, você confirma, e a configuração no provedor do domínio é guiada passo a passo pela plataforma — incluindo a emissão do certificado de segurança (https).

## Validação

- Build sem erros.
- Rede de Sites abre normalmente, com a lista de domínios simplificada.
- Nenhuma referência restante à tela de DNS removida.
