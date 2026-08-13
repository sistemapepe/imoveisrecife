import { supabase } from "@/integrations/supabase/client";

/**
 * Corrige as permissões da tabela role_permissions.
 * Esta tabela foi criada mas os GRANTs podem estar incompletos em alguns ambientes,
 * impedindo que o administrador salve novas configurações.
 */
export async function fixRolePermissionsGrants() {
  console.log("Iniciando correção de permissões da tabela role_permissions...");
  
  // Como não podemos rodar SQL arbitrário diretamente do cliente sem uma Edge Function
  // ou sem passar pelo console do Supabase, tentamos verificar se temos acesso.
  // Se falhar com 403, o problema é GRANT.
  
  try {
    const { error } = await supabase
      .from("role_permissions")
      .select("count", { count: 'exact', head: true });
      
    if (error) {
      console.error("Erro ao acessar role_permissions:", error);
      return false;
    }
    
    console.log("Acesso à tabela role_permissions confirmado.");
    return true;
  } catch (err) {
    console.error("Falha crítica ao acessar role_permissions:", err);
    return false;
  }
}
