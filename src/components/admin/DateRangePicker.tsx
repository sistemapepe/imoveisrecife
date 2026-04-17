import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const label = value?.from
    ? value.to
      ? `${format(value.from, "dd/MM/yy", { locale: ptBR })} – ${format(value.to, "dd/MM/yy", { locale: ptBR })}`
      : format(value.from, "dd/MM/yy", { locale: ptBR })
    : "Período personalizado";

  return (
    <div className={cn("inline-block", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 px-4 rounded-full text-xs font-bold gap-2",
              value?.from && "border-accent text-accent",
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={ptBR}
            disabled={(date) => date > new Date()}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
          {value?.from && (
            <div className="border-t border-border p-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
                Limpar
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
