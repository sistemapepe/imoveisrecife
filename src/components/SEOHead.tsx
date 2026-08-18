import { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { PropertyContext } from "@/contexts/PropertyContext";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
  keywords,
  noIndex = false,
  jsonLd,
}: SEOHeadProps) {
  const ctx = useContext(PropertyContext);
  const brandName = ctx?.settings?.brandName || "Imóveis Recife";
  const googleVerify = ctx?.settings?.googleSiteVerification || "";
  const bingVerify = ctx?.settings?.bingSiteVerification || "";
  const fullTitle = title ? `${title} | ${brandName}` : `${brandName} — Imóveis de Alto Padrão em Recife e Região`;
  const metaDescription =
    description ||
    `${brandName} — Encontre o imóvel dos seus sonhos em Recife e região. Casas, apartamentos, coberturas e terrenos de alto padrão com atendimento exclusivo.`;
  const metaImage =
    image ||
    "https://storage.googleapis.com/gpt-engineer-file-uploads/DS5c6WwmZJNZ7m6qQpsQVf7Wcev2/social-images/social-1772404647450-LOGO_IMOVEIS_RECIFE.webp";
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const canonical = currentUrl.split("#")[0].split("?")[0];
  const defaultKeywords =
    "imóveis recife, imóveis pernambuco, casas recife, apartamentos recife, coberturas recife, imóveis alto padrão, imóveis de luxo recife, comprar imóvel recife, terrenos recife";
  const metaKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const robots = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1";

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="author" content={brandName} />
      <link rel="canonical" href={canonical} />
      <html lang="pt-BR" />
      {googleVerify && <meta name="google-site-verification" content={googleVerify} />}
      {bingVerify && <meta name="msvalidate.01" content={bingVerify} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content={brandName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
      {ctx?.settings?.twitterUser && <meta name="twitter:site" content={ctx.settings.twitterUser} />}
      {ctx?.settings?.twitterUser && <meta name="twitter:creator" content={ctx.settings.twitterUser} />}

      {/* JSON-LD structured data */}
      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
