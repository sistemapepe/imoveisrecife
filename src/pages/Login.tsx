import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import PageTransition from "@/components/PageTransition";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(isSignUp ? "Conta criada!" : "Login realizado!");
      navigate("/admin");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full gold-gradient flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-accent-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-accent">JHR LUXURY</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isSignUp ? "Criar conta de administrador" : "Acesso Administrativo"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="admin@jhrluxury.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gold-gradient text-accent-foreground font-bold uppercase tracking-wider text-sm disabled:opacity-50"
            >
              {loading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-4 text-sm text-primary font-semibold"
          >
            {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Criar"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-2 text-sm text-muted-foreground"
          >
            ← Voltar ao site
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
