import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input || input.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "Referer": "http://localhost:3000/",
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["pe"],
        languageCode: "es",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Google Places Error:", data);
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = (data.suggestions || [])
      .map((s: any) => {
        const place = s.placePrediction;
        if (!place) return null;
        return {
          placeId: place.placeId,
          text: place.text?.text || "",
          mainText: place.structuredFormat?.mainText?.text || place.text?.text || "",
          secondaryText: place.structuredFormat?.secondaryText?.text || "",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Places API proxy error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}

