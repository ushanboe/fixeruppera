"use client";

import { MapPin, RefreshCw, Package, CircleCheck, CircleX, Navigation } from "lucide-react";
import type { BunningsProduct, BunningsStoreInfo } from "@/lib/bunnings";

interface BunningsShoppingListProps {
  products: BunningsProduct[];
  store: BunningsStoreInfo;
  totalEstimate: number;
  matchedAt: string;
  onChangeStore: () => void;
  onRefresh: () => void;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function BunningsShoppingList({
  products,
  store,
  totalEstimate,
  matchedAt,
  onChangeStore,
  onRefresh,
}: BunningsShoppingListProps) {
  const matched = products.filter((p) => !p.error);
  const unmatched = products.filter((p) => p.error);

  return (
    <div className="space-y-3">
      {/* Store Header */}
      <div className="flex items-center justify-between bg-green-50 rounded-lg p-3 border border-green-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-700" />
          <span className="text-sm font-medium text-green-900">{store.name}</span>
        </div>
        <button
          onClick={onChangeStore}
          className="btn text-xs text-green-700 font-medium hover:underline"
        >
          Change
        </button>
      </div>

      {/* Matched Products */}
      {matched.map((product, index) => (
        <div
          key={product.itemNumber || index}
          className="p-3 rounded-lg bg-gray-50 border border-gray-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm leading-tight">
                {product.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {product.matchedTo}
              </div>
            </div>
            {product.price != null && (
              <div className="text-sm font-bold text-green-700 whitespace-nowrap">
                ${product.price.toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs">
            {/* Stock status */}
            {product.inStock != null && (
              <span className={product.inStock ? "text-green-600 flex items-center gap-1" : "text-red-500 flex items-center gap-1"}>
                {product.inStock ? (
                  <CircleCheck className="w-3 h-3" />
                ) : (
                  <CircleX className="w-3 h-3" />
                )}
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            )}

            {/* Aisle/Bay */}
            {(product.aisle || product.bay) && (
              <span className="text-blue-600 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {product.aisle && `Aisle ${product.aisle}`}
                {product.aisle && product.bay && ", "}
                {product.bay && `Bay ${product.bay}`}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Unmatched Items */}
      {unmatched.map((product, index) => (
        <div
          key={`unmatched-${index}`}
          className="p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <div className="font-medium text-gray-700 text-sm">{product.matchedTo}</div>
              <div className="text-xs text-gray-400 mt-0.5">Not found at Bunnings</div>
            </div>
          </div>
        </div>
      ))}

      {/* Total + Refresh */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div>
          {totalEstimate > 0 && (
            <div className="text-sm font-bold text-gray-900">
              Estimated total: ${totalEstimate.toFixed(2)}
            </div>
          )}
          <div className="text-xs text-gray-400">
            Checked {timeAgo(matchedAt)}
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="btn flex items-center gap-1 text-xs text-green-600 font-medium hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>
    </div>
  );
}
