import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RecentViewsBadgeProps {
  propertyId: string;
}

export default function RecentViewsBadge({ propertyId }: RecentViewsBadgeProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCount = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: c } = await supabase
        .from("property_views")
        .select("id", { count: "exact", head: true })
        .eq("property_id", propertyId)
        .gte("created_at", since);
      if (!cancelled && typeof c === "number") setCount(c);
    };
    fetchCount();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  if (!count || count < 3) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/5 border border-accent/20 text-accent text-[10px] font-extrabold uppercase tracking-wider">
      <Eye className="h-3 w-3" />
      <span>{count} pessoas viram nas últimas 24h</span>
    </div>
  );
}
