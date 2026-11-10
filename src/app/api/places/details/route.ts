import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "placeId es requerido" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "location,formattedAddress,addressComponents",
        "Referer": "http://localhost:3000/",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Place Details Error:", data);
      return NextResponse.json({ error: "No se pudo obtener el detalle" }, { status: 500 });
    }

    let district = "";
    if (data.addressComponents) {
      const locality = data.addressComponents.find((c: any) =>
        c.types?.includes("locality")
      );
      const sublocality = data.addressComponents.find((c: any) =>
        c.types?.includes("sublocality_level_1") || c.types?.includes("sublocality")
      );
      const admin3 = data.addressComponents.find((c: any) =>
        c.types?.includes("administrative_area_level_3")
      );

      // Prioritize sublocality if locality is "Lima" or generic
      if (locality?.longText && locality.longText.toLowerCase() !== "lima") {
        district = locality.longText;
      } else if (sublocality?.longText) {
        district = sublocality.longText;
      } else if (admin3?.longText) {
        district = admin3.longText;
      } else if (locality?.longText) {
        district = locality.longText;
      }
    }

    return NextResponse.json({
      address: data.formattedAddress || "",
      lat: data.location?.latitude,
      lng: data.location?.longitude,
      district,
    });
  } catch (error) {
    console.error("Place details proxy error:", error);
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}

