import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/contexts/PropertyContext";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const defaultPolicy = `## Política de Privacidade

Esta política descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

### 1. Dados Coletados
Coletamos informações fornecidas voluntariamente por você, como nome, e-mail, telefone e interesse em imóveis, através de nosso formulário de contato.

### 2. Finalidade
Seus dados são utilizados exclusivamente para:
- Responder às suas solicitações de contato
- Enviar informações sobre imóveis de seu interesse
- Melhorar nossos serviços

### 3. Compartilhamento
Não compartilhamos seus dados pessoais com terceiros, exceto quando necessário para cumprir obrigações legais.

### 4. Armazenamento e Segurança
Seus dados são armazenados em servidores seguros e protegidos por medidas técnicas adequadas.

### 5. Seus Direitos
Você tem direito a acessar, corrigir, eliminar ou solicitar a portabilidade de seus dados pessoais a qualquer momento.

### 6. Cookies
Utilizamos cookies essenciais para o funcionamento do site. Ao continuar navegando, você concorda com o uso desses cookies.

### 7. Contato
Para exercer seus direitos ou esclarecer dúvidas, entre em contato conosco pela página de contato.`;

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { settings } = useProperties();
  const content = settings.privacyPolicy || defaultPolicy;

  return (
    <PageTransition>
      <SEOHead title="Política de Privacidade" description="Política de privacidade e proteção de dados - LGPD" />
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Política de Privacidade</h1>
        </header>
        <div className="px-4 py-6 max-w-3xl mx-auto prose prose-sm dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground">
          {content.split("\n").map((line, i) => {
            if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-6 mb-2 text-foreground">{line.replace("### ", "")}</h3>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-8 mb-3 text-foreground">{line.replace("## ", "")}</h2>;
            if (line.startsWith("- ")) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.replace("- ", "")}</li>;
            if (line.trim() === "") return <br key={i} />;
            return <p key={i} className="text-sm text-muted-foreground mb-2">{line}</p>;
          })}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
