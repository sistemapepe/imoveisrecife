import { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { PropertyContext } from "@/contexts/PropertyContext";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
}: SEOHeadProps) {
  const ctx = useContext(PropertyContext);
  const brandName = ctx?.settings?.brandName || "Imóveis Recife";
  const fullTitle = title ? `${title} | ${brandName}` : brandName;
  const metaDescription =
    description || `${brandName} — Encontre o imóvel dos seus sonhos em Recife e região.`;
  const metaImage =
    image ||
    "https://storage.googleapis.com/gpt-engineer-file-uploads/DS5c6WwmZJNZ7m6qQpsQVf7Wcev2/social-images/social-1772404647450-LOGO_IMOVEIS_RECIFE.webp";
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
