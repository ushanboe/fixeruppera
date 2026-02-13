"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Loader2 } from "lucide-react";
import type { BunningsStoreInfo } from "@/lib/bunnings";

interface StoreSelectorProps {
  onSelect: (store: BunningsStoreInfo) => void;
  onClose: () => void;
}

interface StoreOption {
  locationCode: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export default function StoreSelector({ onSelect, onClose }: StoreSelectorProps) {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    findNearbyStores();
  }, []);

  const findNearbyStores = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          const response = await fetch("/api/bunnings/stores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude, timezone }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to find stores");
          }

          const data = await response.json();
          setStores(data.stores || []);

          if (!data.stores || data.stores.length === 0) {
            setError("No Bunnings stores found nearby");
          }
        } catch (err: any) {
          setError(err.message || "Failed to find nearby stores");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Please enable location access to find your nearest Bunnings");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleSelect = (store: StoreOption) => {
    const storeInfo: BunningsStoreInfo = {
      locationCode: store.locationCode,
      name: store.name,
      address: store.address,
    };

    try {
      localStorage.setItem(
        "fixeruppera_bunnings_store",
        JSON.stringify({ ...storeInfo, savedAt: new Date().toISOString() })
      );
    } catch {
      // localStorage full — continue without persisting
    }

    onSelect(storeInfo);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Select Your Bunnings
          </h3>
          <button onClick={onClose} className="btn p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-3" />
              <p className="text-sm">Finding nearby stores...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button
                onClick={findNearbyStores}
                className="btn text-sm text-green-600 font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && stores.length > 0 && (
            <div className="space-y-2">
              {stores.map((store) => (
                <button
                  key={store.locationCode}
                  onClick={() => handleSelect(store)}
                  className="btn w-full text-left p-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{store.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{store.address}</div>
                  {store.distance != null && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      {store.distance < 1
                        ? `${Math.round(store.distance * 1000)}m away`
                        : `${store.distance.toFixed(1)}km away`}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
