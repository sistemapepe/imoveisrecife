import React from "react";

const PageLoader = React.forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="flex items-center justify-center min-h-[40vh] w-full py-12">
    <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
  </div>
));

PageLoader.displayName = "PageLoader";
export default PageLoader;
