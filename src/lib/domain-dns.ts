import { supabase } from "@/integrations/supabase/client";

export const DOMAIN_TARGET_IP = "185.158.133.1";
export const DOMAIN_TXT_NAME = "_lovable";

export type DnsVerdict = "ok" | "ausente" | "apontando_para_outro";

export interface DnsRecordCheck {
  type: "A" | "TXT";
  name: string;
  host: string;
  expected: string;
  found: string[];
  verdict: DnsVerdict;
}

export interface DomainCheck {
  hostname: string;
  root: string;
  www: string;
  target_ip: string;
  records: DnsRecordCheck[];
  pointed: boolean;
  https_ok: boolean;
}

export function normalizeHostname(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

export function isValidHostname(host: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host);
}

export async function checkDomainDns(hostname: string): Promise<DomainCheck> {
  const { data, error } = await supabase.functions.invoke("check-domain-dns", {
    body: { hostname },
  });
  if (error) throw error;
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as DomainCheck;
}

export const VERDICT_LABEL: Record<DnsVerdict, string> = {
  ok: "Configurado corretamente",
  ausente: "Ainda não encontrado (pode estar propagando)",
  apontando_para_outro: "Apontando para outro servidor",
};

export const PROVIDER_HELP: { name: string; steps: string }[] = [
  {
    name: "Registro.br",
    steps:
      "Entre em Painel > Meus Domínios > selecione o domínio > DNS > Editar Zona. Adicione os registros abaixo e salve.",
  },
  {
    name: "GoDaddy",
    steps: "Entre em Meus Produtos > DNS > Gerenciar Zonas. Use Adicionar Registro para cada linha abaixo.",
  },
  {
    name: "Hostinger",
    steps: "Entre em hPanel > Domínios > Zona DNS. Adicione os registros abaixo e aguarde a propagação.",
  },
  {
    name: "Cloudflare",
    steps:
      "Em DNS > Records, adicione os registros abaixo e deixe a nuvem CINZA (proxy desligado). Com o proxy laranja o certificado não é emitido.",
  },
];
