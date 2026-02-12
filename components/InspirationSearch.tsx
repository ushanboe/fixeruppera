"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, ChevronLeft } from "lucide-react";

interface InspirationImage {
  id: string;
  thumb: string;
  regular: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  downloadLink: string;
}

interface InspirationSearchProps {
  onSelect: (imageDataUrl: string) => void;
  onClose: () => void;
  defaultQuery?: string;
}

export default function InspirationSearch({ onSelect, onClose, defaultQuery = "furniture style" }: InspirationSearchProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const searchImages = useCallback(async (searchQuery: string, pageNum: number, append = false) => {
    if (!searchQuery.trim()) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetch(
        (`/api/upcycle/search-inspiration?query=${encodeURIComponent(searchQuery)}&page=${pageNum}`)
      );
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (append) {
        setImages((prev) => [...prev, ...data.images]);
      } else {
        setImages(data.images);
      }
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch {
      setError("Failed to search. Check your connection.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial search on mount
  useEffect(() => {
    searchImages(defaultQuery, 1);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      searchImages(query, 1);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Debounced search
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (value.trim()) {
        searchImages(value, 1);
      }
    }, 600);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      searchImages(query, page + 1, true);
    }
  };

  const handleSelectImage = async (image: InspirationImage) => {
    setSelectedId(image.id);

    try {
      // Trigger Unsplash download tracking (required by their guidelines)
      fetch((`/api/upcycle/search-inspiration?download=${encodeURIComponent(image.downloadLink)}`)).catch(() => {});

      // Load the regular-sized image and convert to data URL via canvas
      const dataUrl = await loadImageAsDataUrl(image.regular);
      onSelect(dataUrl);
    } catch {
      console.error("Failed to load inspiration image");
      setSelectedId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <button
          onClick={onClose}
          className="btn w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search furniture styles..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {["furniture style", "mid-century modern", "farmhouse rustic", "industrial", "bohemian", "scandinavian", "painted furniture", "chalk paint"].map((chip) => (
          <button
            key={chip}
            onClick={() => { setQuery(chip); searchImages(chip, 1); }}
            className={`btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              query === chip
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Searching...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            <button
              onClick={handleSearch}
              className="btn px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">No results found. Try a different search.</p>
          </div>
        ) : (
          <>
            {/* Image grid */}
            <div className="grid grid-cols-2 gap-2">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleSelectImage(image)}
                  disabled={selectedId !== null}
                  className="btn relative rounded-xl overflow-hidden bg-gray-900 aspect-square group"
                >
                  <img
                    src={image.thumb}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Photographer credit overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] truncate">
                      {image.photographer}
                    </p>
                  </div>
                  {/* Selected loading overlay */}
                  {selectedId === image.id && (
                    <div className="absolute inset-0 bg-purple-900/70 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div className="flex justify-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn px-6 py-3 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}

            {/* Unsplash attribution — required */}
            <div className="text-center py-4">
              <p className="text-gray-600 text-[10px]">
                Photos provided by{" "}
                <a
                  href="https://unsplash.com/?utm_source=fixeruppera&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-gray-500"
                >
                  Unsplash
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Load an image URL into a canvas and return a compressed data URL */
function loadImageAsDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      let width = img.width;
      let height = img.height;
      const maxSize = 1024;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
