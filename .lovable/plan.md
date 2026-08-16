# Plano de Otimização de Performance e Estabilidade

O objetivo deste plano é resolver gargalos de performance e erros de renderização identificados, garantindo uma navegação fluida em dispositivos móveis e desktops, especialmente no Gerenciador Global (`/network-admin`) e na Homepage.

## Melhorias Técnicas

### 1. Estabilização de Renderização (React Refs)
- Corrigir os avisos de "Function components cannot be given refs" que ainda persistem no `ProtectedRoute` e `Login`.
- Garantir que todos os componentes envolvidos em rotas protegidas e navegação suportem `React.forwardRef`.

### 2. Otimização do Gerenciador Global (/network-admin)
- **Eliminação de Suspense Bloqueante**: Ajustar a carga inicial de abas para garantir que o primeiro render seja instantâneo.
- **Cache de Sites**: Implementar cache mais agressivo para a listagem de sites, que é um dos componentes mais pesados do painel.
- **Lazy Loading Granular**: Revisar o carregamento de componentes pesados como `BulkImportTab` e `AnalyticsTab`.

### 3. Aceleração da Homepage e Portal Público
- **Preload de Recursos**: Otimizar o carregamento das fontes (Manrope) e da logo da marca.
- **Redução de Layout Shifts**: Ajustar dimensões fixas para skeletons e containers de imagem.
- **Otimização de Contextos**: Evitar re-renders desnecessários no `SiteContext` e `AuthContext` durante a navegação entre rotas públicas.

### 4. Resiliência de Autenticação
- Ajustar o `AuthContext` para detectar o status de `super_admin` de forma assíncrona porém prioritária, evitando loops de redirecionamento para o login quando o usuário já está autenticado globalmente.

## Detalhes Técnicos
- Refatoração de `src/components/ProtectedRoute.tsx` para usar `React.forwardRef`.
- Refatoração de `src/pages/Login.tsx` para usar `React.forwardRef`.
- Implementação de `Memoization` (useMemo/useCallback) em componentes de listagem (`SitesTab.tsx`, `PropertyCard.tsx`).
- Otimização do `PageLoader.tsx` para ser menos intrusivo.
