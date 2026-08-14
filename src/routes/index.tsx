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
        <p className="text-muted-foreground text-lg">Gerenciamento multi-tenant e visão global do ecossistema.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-luxury-dark-lighter/40 border-accent/20 hover:border-accent/40 transition-all group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Globe2 className="w-6 h-6 text-accent" />
              <CardTitle className="text-accent font-serif">Gerenciar Sites</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground/80">
              Visualize todos os domínios, gerencie owner_ids e verifique o status de cada instância.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/admin')} 
              variant="outline" 
              className="w-full border-accent/30 text-accent hover:bg-accent/10 group-hover:bg-accent group-hover:text-luxury-dark font-bold"
            >
              Acessar Painel de Sites <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-luxury-dark-lighter/40 border-accent/20 hover:border-accent/40 transition-all group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="w-6 h-6 text-accent" />
              <CardTitle className="text-accent font-serif">Admin Geral</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground/80">
              Acesso total a todas as funcionalidades do sistema para o site atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/admin')} 
              variant="outline" 
              className="w-full border-accent/30 text-accent hover:bg-accent/10 group-hover:bg-accent group-hover:text-luxury-dark font-bold"
            >
              Painel Administrativo <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="bg-card/5 rounded-3xl p-8 border border-white/5 space-y-6">
        <h3 className="text-xl font-serif font-bold text-accent flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Instruções de Acesso
        </h3>
        <ul className="space-y-4 text-sm text-muted-foreground">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">1</span>
            <p>Para gerenciar múltiplos sites, você deve estar logado com uma conta de <strong>Super Admin</strong>.</p>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">2</span>
            <p>Acesse o menu <strong>"Sites"</strong> na barra lateral esquerda do painel Admin para ver a lista completa de instâncias.</p>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">3</span>
            <p>A funcionalidade de <strong>provisionamento automático</strong> garante que novos domínios recebam configurações iniciais imediatamente após o primeiro acesso.</p>
          </li>
        </ul>
      </section>

      <footer className="text-center pt-8 opacity-50">
        <p className="text-xs">Sistema Multi-tenant Imobiliário v2.0</p>
      </footer>
    </div>
  );
}
