import { useMemo, useState } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPriceFull } from "@/contexts/PropertyContext";
import { PriceDisplay } from "@/components/PriceDisplay";

interface FinancingSimulatorProps {
  price: number;
}

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function FinancingSimulator({ price }: FinancingSimulatorProps) {
  const [open, setOpen] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(30);
  const [annualRate, setAnnualRate] = useState(11); // % ao ano (Brasil 2024 ~10–12%)

  // Validação defensiva
  const safeDownPct = Math.min(90, Math.max(10, downPct));
  const safeYears = Math.min(35, Math.max(5, years));
  const safeRate = Math.min(20, Math.max(1, annualRate));

  const { downPayment, financed, monthly, totalPaid, totalInterest } = useMemo(() => {
    const down = price * (safeDownPct / 100);
    const fin = price - down;
    const months = safeYears * 12;
    const monthlyRate = safeRate / 100 / 12;
    // Price (parcelas iguais)
    const m =
      monthlyRate === 0
        ? fin / months
        : (fin * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const total = m * months;
    return {
      downPayment: down,
      financed: fin,
      monthly: m,
      totalPaid: total + down,
      totalInterest: total - fin,
    };
  }, [price, safeDownPct, safeYears, safeRate]);

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="financing-content"
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-accent" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold">Simulador de Financiamento</h2>
            <p className="text-xs text-muted-foreground">Estime sua parcela mensal</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="financing-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label htmlFor="down-pct" className="font-medium">Entrada</label>
                  <span className="text-accent font-bold">
                    {safeDownPct}% · {formatBRL(downPayment)}
                  </span>
                </div>
                <input
                  id="down-pct"
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={safeDownPct}
                  onChange={(e) => setDownPct(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label htmlFor="years" className="font-medium">Prazo</label>
                  <span className="text-accent font-bold">{safeYears} anos</span>
                </div>
                <input
                  id="years"
                  type="range"
                  min={5}
                  max={35}
                  step={5}
                  value={safeYears}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label htmlFor="rate" className="font-medium">Taxa de juros (a.a.)</label>
                  <span className="text-accent font-bold">{safeRate}%</span>
                </div>
                <input
                  id="rate"
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={safeRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Parcela estimada</span>
                  <span className="text-2xl font-extrabold text-accent">{formatBRL(monthly)}/mês</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border">
                  <div>
                    <div className="text-muted-foreground">Valor financiado</div>
                    <div className="font-semibold">{formatBRL(financed)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total a pagar</div>
                    <div className="font-semibold">{formatBRL(totalPaid)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Juros totais</div>
                    <div className="font-semibold">{formatBRL(totalInterest)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Imóvel</div>
                    <PriceDisplay as="div" section="simulator" value={price} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                Simulação ilustrativa pelo sistema Price. Valores reais dependem de aprovação bancária, seguros e tarifas.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
