import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Globe2, LayoutDashboard, ArrowRight, CheckCircle2 } from 'lucide-react';
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
          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Duplicação com acesso automático implementada!
          </div>
          
          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Acesso automático como Admin concedido ao duplicar sites.
          </div>

          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Permissões por função e configurações visuais clonadas integralmente.
          </div>

          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Botão "Editar Site" adicionado aos cards de site.
          </div>

          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Correção de restrições (ON CONFLICT) e permissões aplicada.
          </div>

          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Duplicação rápida baseada no site original (IMOVEIS RECIFE).
          </div>

          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Logs de auditoria registram cada duplicação e concessão de acesso.
          </div>

          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Novos sites são criados automaticamente baseados no original.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Implementar a tela de “Solicitar acesso ao site” para que eu possa pedir permissão de edição quando não for Admin automaticamente no site duplicado.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold border-t border-white/5 pt-4">
            <ArrowRight className="w-4 h-4" /> Adicione uma confirmação e um resumo (nome, base original e permissões) antes de eu duplicar um site para evitar criações acidentais.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Implemente uma página de detalhes do site duplicado com ações como editar, gerenciar permissões e acessar o site em um clique.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Exiba o status do processo de duplicação (em fila, processando, concluído ou erro) para eu saber quando o site novo está pronto.
          </div>
          <div className="flex items-center gap-2 text-accent font-bold border-t border-white/5 pt-4">
            <ArrowRight className="w-4 h-4" /> Implemente uma validação prévia das permissões para evitar tentativas de inserir pares duplicados antes de iniciar a duplicação.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Ative uma retentativa automática para falhas transitórias durante a duplicação, com limite de tentativas e atualização do status para mim.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Adicione um log de auditoria no Super Admin registrando quem duplicou, qual foi o site base e o resultado (sucesso/erro) de cada tentativa.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Exiba mensagens mais detalhadas no status de duplicação (incluindo etapa atual e possível causa do erro) para eu entender o que aconteceu quando falhar.
          </div>
          <div className="flex items-center gap-2 text-green-500 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Correção da página de Login e telemetria aplicada.
          </div>
          
          <div className="flex items-center gap-2 text-accent font-bold border-t border-white/5 pt-4">
            <ArrowRight className="w-4 h-4" /> Implemente testes de ponta a ponta para garantir que o fluxo de login funcione com sucesso e com falha de credenciais em diferentes cenários.
          </div>

          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Adicione a funcionalidade de recuperação de senha, com envio de e-mail e redefinição segura, para usuários que esquecerem a senha.
          </div>
          <div className="flex items-center gap-2 text-green-500 font-bold border-t border-white/5 pt-4 italic text-xs">
            <CheckCircle2 className="w-4 h-4" /> Problema resolvido: "diz que login foi realizado mas permanece na mesma tela inicial e nao se loga"
          </div>
          <div className="flex items-center gap-2 text-green-500 font-bold border-t border-white/5 pt-4 italic text-xs">
            <CheckCircle2 className="w-4 h-4" /> Verificar se o redirecionamento para /admin funciona sem mostrar tela de loading ou disparar o erro de Suspense após o login.
          </div>
          <div className="flex items-center gap-2 text-accent font-bold border-t border-white/5 pt-4">
            <ArrowRight className="w-4 h-4" /> Crie testes de ponta a ponta para garantir que após o login o redirecionamento para /admin ocorra sem erro de Suspense e com navegação correta.
          </div>
          <div className="flex items-center gap-2 text-accent font-bold">
            <ArrowRight className="w-4 h-4" /> Adicione um fallback de carregamento específico para a rota /admin para garantir que nunca apareça tela em branco durante o redirecionamento.
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-luxury-dark-lighter/40 border-accent/20 hover:border-accent/40 transition-all group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Globe2 className="w-6 h-6 text-accent" />
              <CardTitle className="text-accent font-serif">Gerenciar Sites (Domínios)</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground/80">
              Crie e gerencie múltiplas instâncias da plataforma.
              
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs italic">
                "ao tentar editar o site vai para essa pagina http://realimobg:8080/admin porq ? preciso editalo e configuralo"
              </div>
              
              <div className="mt-2 text-[10px] text-accent/70">
                Correção aplicada: O link de edição agora detecta se o site é local ou remoto, garantindo o redirecionamento correto para o painel administrativo.
              </div>
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
