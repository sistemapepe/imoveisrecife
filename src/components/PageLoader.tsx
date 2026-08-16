import React from "react";

const PageLoader = React.forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));

PageLoader.displayName = "PageLoader";
export default PageLoader;
