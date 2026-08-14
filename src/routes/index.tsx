import React from 'react';

export default function Index() {
  return (
    <div className="p-8 space-y-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Plano de Implementação Multi-tenant</h1>
      
      <section className="space-y-4">
        <p>Adicione uma tela de administração para criar e gerenciar sites (domínio, owner_id e status) e alternar o contexto de site no painel.</p>
        <p>Implemente o provisionamento automático de site quando um novo domínio acessa o app, criando o registro em sites e preparando as configs iniciais.</p>
        <p>Crie testes automatizados para validar que usuários de um site não conseguem ler/escrever dados de outros sites via RLS, exceto Super Admin.</p>
        <p>Adicione um audit log no modo admin registrando ações de criação/edição/exclusão por site_id para melhorar rastreabilidade e segurança.</p>
        <p>Implemente relatórios e exportação (CSV/PDF) de leads, visualizações e acessos filtrados por site_id diretamente no dashboard do admin.</p>
        <p>Adicione um painel no Admin para o superadmin gerenciar múltiplos sites (domínio, owner_id) e verificar status de conexão/atualização.</p>
        <p>Implemente a identificação automática do tenant pelo domínio e aplique o filtro de site_id em todas as consultas do Supabase.</p>
        <p>Configure as políticas de Row Level Security para que o superadmin consiga ignorar site_id e que cada usuário admin veja apenas seus dados.</p>
        <p>Crie uma etapa no cadastro/duplicação para inserir automaticamente o novo domínio e provisionar os registros iniciais do tenant (configurações e permissões).</p>
        <p>Implemente um fallback quando o domínio não existir (exibir tela de erro ou página de onboarding) e registrar a tentativa no log.</p>
      </section>
    </div>
  );
}
