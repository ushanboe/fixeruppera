"use client";

import { useState, useEffect } from "react";
import { Calculator, ChevronDown } from "lucide-react";

export interface ProfitData {
  purchasePrice: string;
  additionalMaterials: string;
  estimatedHours: string;
  hourlyRate: string;
  sellingPrice: string;
  projectedProfit: number;
  profitMargin: number;
}

interface ProfitCalculatorProps {
  costEstimate?: { min: number; max: number };
  timeEstimate?: { minHours: number; maxHours: number };
  resale?: {
    enabled: boolean;
    range?: { min: number; max: number; currency: string };
    note?: string;
  };
  initialData?: ProfitData;
  onDataChange?: (data: ProfitData) => void;
}

export default function ProfitCalculator({
  costEstimate,
  timeEstimate,
  resale,
  initialData,
  onDataChange,
}: ProfitCalculatorProps) {
  const [isOpen, setIsOpen] = useState(!!initialData);
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice || "");
  const [additionalMaterials, setAdditionalMaterials] = useState(initialData?.additionalMaterials || "");
  const [estimatedHours, setEstimatedHours] = useState(initialData?.estimatedHours || "");
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourlyRate || "");
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice || "");

  useEffect(() => {
    // If we have saved data, don't overwrite with plan defaults
    if (initialData) {
      try {
        const saved = localStorage.getItem("fixeruppera_hourly_rate");
        if (saved && !initialData.hourlyRate) setHourlyRate(saved);
      } catch { /* ignore */ }
      return;
    }
    // Pre-fill materials cost from plan average
    if (costEstimate) {
      const avg = Math.round((costEstimate.min + costEstimate.max) / 2);
      setAdditionalMaterials(avg.toString());
    }
    // Pre-fill time from plan average
    if (timeEstimate) {
      const avg = Math.round(
        (timeEstimate.minHours + timeEstimate.maxHours) / 2
      );
      setEstimatedHours(avg.toString());
    }
    // Pre-fill selling price from resale average
    if (resale?.enabled && resale.range) {
      const avg = Math.round((resale.range.min + resale.range.max) / 2);
      setSellingPrice(avg.toString());
    }
    // Load hourly rate from localStorage
    try {
      const saved = localStorage.getItem("fixeruppera_hourly_rate");
      setHourlyRate(saved || "15");
    } catch {
      setHourlyRate("15");
    }
  }, [costEstimate, timeEstimate, resale, initialData]);

  const handleHourlyRateChange = (value: string) => {
    setHourlyRate(value);
    try {
      if (value) {
        localStorage.setItem("fixeruppera_hourly_rate", value);
      }
    } catch {
      // localStorage not available
    }
  };

  // Calculations
  const purchaseNum = parseFloat(purchasePrice) || 0;
  const materialsNum = parseFloat(additionalMaterials) || 0;
  const hoursNum = parseFloat(estimatedHours) || 0;
  const rateNum = parseFloat(hourlyRate) || 0;
  const sellingNum = parseFloat(sellingPrice) || 0;

  const laborCost = hoursNum * rateNum;
  const totalInvestment = purchaseNum + materialsNum + laborCost;
  const projectedProfit = sellingNum - totalInvestment;
  const profitMargin =
    sellingNum > 0 ? (projectedProfit / sellingNum) * 100 : 0;

  const hasValues = sellingNum > 0 && totalInvestment > 0;

  // Notify parent of data changes for saving
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        purchasePrice,
        additionalMaterials,
        estimatedHours,
        hourlyRate,
        sellingPrice,
        projectedProfit,
        profitMargin,
      });
    }
  }, [purchasePrice, additionalMaterials, estimatedHours, hourlyRate, sellingPrice, projectedProfit, profitMargin, onDataChange]);

  const getVerdict = () => {
    if (!hasValues) {
      return {
        color: "text-gray-500",
        bg: "bg-gray-50 border-gray-200",
        text: "Enter values to calculate",
      };
    }
    if (profitMargin >= 40) {
      return {
        color: "text-green-600",
        bg: "bg-green-50 border-green-200",
        text: "Great flip! Strong profit margin.",
      };
    }
    if (profitMargin >= 15) {
      return {
        color: "text-yellow-600",
        bg: "bg-yellow-50 border-yellow-200",
        text: "Decent return. Worth doing if you enjoy it.",
      };
    }
    return {
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      text: "Consider skipping. Thin margin for the effort.",
    };
  };

  const verdict = getVerdict();

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn w-full flex items-center justify-between p-6"
      >
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          Profit Calculator
          {hasValues && !isOpen && (
            <span
              className={`text-sm font-semibold ml-2 ${
                projectedProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {projectedProfit >= 0 ? "+" : ""}${projectedProfit.toFixed(0)}
            </span>
          )}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-6 space-y-4">
          {/* Input Fields */}
          <div className="space-y-3">
            <InputRow
              label="Purchase Price"
              value={purchasePrice}
              onChange={setPurchasePrice}
              placeholder="What you paid"
              prefix="$"
            />
            <InputRow
              label="Materials Cost"
              value={additionalMaterials}
              onChange={setAdditionalMaterials}
              placeholder="0"
              prefix="$"
            />
            <InputRow
              label="Estimated Hours"
              value={estimatedHours}
              onChange={setEstimatedHours}
              placeholder="0"
              suffix="hrs"
            />
            <InputRow
              label="Your Hourly Rate"
              value={hourlyRate}
              onChange={handleHourlyRateChange}
              placeholder="15"
              prefix="$"
              sublabel="Saved for next time"
            />
            <InputRow
              label="Selling Price"
              value={sellingPrice}
              onChange={setSellingPrice}
              placeholder="0"
              prefix="$"
            />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200" />

          {/* Results */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Total Investment</div>
              <div className="font-bold text-gray-900">
                ${totalInvestment.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Labor Cost</div>
              <div className="font-bold text-gray-900">
                ${laborCost.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Profit & Verdict */}
          <div className={`rounded-lg p-4 border ${verdict.bg}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-semibold ${verdict.color}`}>
                Projected Profit
              </span>
              <span
                className={`text-xl font-black ${
                  !hasValues
                    ? "text-gray-400"
                    : projectedProfit >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {hasValues
                  ? `${projectedProfit >= 0 ? "+" : ""}$${projectedProfit.toFixed(2)}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Profit Margin</span>
              <span className={`text-sm font-bold ${verdict.color}`}>
                {hasValues ? `${profitMargin.toFixed(1)}%` : "—"}
              </span>
            </div>
            <div className={`mt-2 text-sm font-bold ${verdict.color}`}>
              {verdict.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputRow({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  sublabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  sublabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <label className="text-sm text-gray-600">{label}</label>
          {sublabel && (
            <span className="block text-xs text-gray-400">{sublabel}</span>
          )}
        </div>
        <div className="relative w-32">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {prefix}
            </span>
          )}
          <input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full ${prefix ? "pl-7" : "pl-3"} ${
              suffix ? "pr-10" : "pr-3"
            } py-2 rounded-lg border border-gray-200 text-gray-900 text-sm text-right focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400`}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
