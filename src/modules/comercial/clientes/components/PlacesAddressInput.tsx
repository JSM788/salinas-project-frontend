"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Loader2, MapPin } from "lucide-react";

interface PlacesAddressInputProps {
  value: string;
  onChange: (address: string, details?: { lat?: number; lng?: number; district?: string }) => void;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  errorId?: string;
}

interface Suggestion {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
}

export function PlacesAddressInput({
  value,
  onChange,
  disabled,
  required,
  hasError,
  errorId,
}: PlacesAddressInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticChange = useRef(false);

  useEffect(() => {
    if (value !== query) {
      isProgrammaticChange.current = true;
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isProgrammaticChange.current) {
      isProgrammaticChange.current = false;
      return;
    }

    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/autocomplete/?input=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const items = data.suggestions || [];
          setSuggestions(items);
          setShowDropdown(items.length > 0);
        }
      } catch (err) {
        console.warn("Error fetching place suggestions:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (suggestion: Suggestion) => {
    // Marcamos cambio programático para que la selección no re-dispare el efecto de búsqueda
    isProgrammaticChange.current = true;
    setShowDropdown(false);
    setSuggestions([]);
    setQuery(suggestion.text);
    setLoading(true);

    try {
      const res = await fetch(`/api/places/details/?placeId=${suggestion.placeId}`);
      if (res.ok) {
        const details = await res.json();
        const selectedAddress = details.address || suggestion.text;
        isProgrammaticChange.current = true;
        setQuery(selectedAddress);
        onChange(selectedAddress, {
          lat: details.lat,
          lng: details.lng,
          district: details.district,
        });
      } else {
        onChange(suggestion.text);
      }
    } catch {
      onChange(suggestion.text);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        name="address"
        value={query}
        required={required}
        aria-invalid={hasError}
        aria-describedby={errorId}
        disabled={disabled}
        placeholder="Escribe la dirección o local (ej. Av. Cuba 450, Jesús María)..."
        onChange={(e) => {
          isProgrammaticChange.current = false;
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setShowDropdown(false);
          }
        }}
        className="pr-8"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-zinc-200 rounded-md shadow-lg py-1 text-xs">
          {suggestions.map((item) => (
            <li
              key={item.placeId}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              className="px-3 py-2 hover:bg-zinc-100 cursor-pointer flex items-start gap-2 border-b border-zinc-50 last:border-b-0"
            >
              <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-zinc-900">{item.mainText}</p>
                {item.secondaryText && (
                  <p className="text-2xs text-zinc-500">{item.secondaryText}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
