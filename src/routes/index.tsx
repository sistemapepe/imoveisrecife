import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Globe2, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-luxury-dark text-card p-8 font-sans space-y-12 max-w-4xl mx-auto">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-accent/10 mb-4">
          <ShieldCheck className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-accent">Central do Super Admin</h1>
        <p className="text-muted-foreground text-lg">Plano de Ação e Gerenciamento Multi-tenant.</p>
      </header>
      
      <section className="bg-card/5 rounded-3xl p-8 border border-white/5 space-y-6">
        <h3 className="text-xl font-serif font-bold text-accent flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Próximas Etapas
        </h3>
        <div className="space-y-4 text-sm text-muted-foreground whitespace-pre-line">
          Adicionar um botão de duplicar um site na tela de Super Admin em /admin e confirmar quais dados serão copiados (configs e permissões).

          Criar uma página dedicada para o gerenciamento de Sites do Super Admin, com URL direta, e garantir que ela fique disponível somente para superadmin.

          Implementar uma seção de status detalhado por domínio/tenant (última atualização, saúde da conexão e erros) na lista de sites do Super Admin.

          Adicionar busca e filtros na listagem de sites (por domínio, owner_id e status) para facilitar encontrar e selecionar tenants no Super Admin.
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-luxury-dark-lighter/40 border-accent/20 hover:border-accent/40 transition-all group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Globe2 className="w-6 h-6 text-accent" />
              <CardTitle className="text-accent font-serif">Gerenciar Sites</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground/80">
              Acesse o painel para gerenciar domínios e tenants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/admin')} 
              variant="outline" 
              className="w-full border-accent/30 text-accent hover:bg-accent/10 group-hover:bg-accent group-hover:text-luxury-dark font-bold"
            >
              Acessar Painel <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-luxury-dark-lighter/40 border-accent/20 hover:border-accent/40 transition-all group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="w-6 h-6 text-accent" />
              <CardTitle className="text-accent font-serif">Dashboard</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground/80">
              Visualização geral do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/admin')} 
              variant="outline" 
              className="w-full border-accent/30 text-accent hover:bg-accent/10 group-hover:bg-accent group-hover:text-luxury-dark font-bold"
            >
              Ver Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center pt-8 opacity-50">
        <p className="text-xs">Sistema Multi-tenant Imobiliário v2.0</p>
      </footer>
    </div>
  );
}
