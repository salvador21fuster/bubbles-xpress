import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Free geocoding service - OpenStreetMap Nominatim
async function searchAddressNominatim(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        countrycodes: 'ie', // Ireland only
        limit: '5'
      }),
      {
        headers: {
          'User-Agent': 'MrBubblesExpress/1.0'
        }
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Nominatim error:", error);
    return [];
  }
}

export async function searchAddress(query: string): Promise<Array<{
  displayName: string;
  street: string;
  city: string;
  county: string;
  postcode: string;
  lat: number;
  lon: number;
}>> {
  // Get raw results from Nominatim
  const rawResults = await searchAddressNominatim(query);
  
  if (rawResults.length === 0) {
    return [];
  }

  try {

    // Use Gemini AI to intelligently rank and format the results
    const systemPrompt = `You are an intelligent address formatter for Ireland. 
Given search results from a geocoding API, rank them by relevance to the user's search query and format them in a user-friendly way.

Rules:
1. Prioritize complete street addresses over general areas
2. Format as: "Street Number Street Name, City, County Postcode" 
3. Return ONLY a JSON array of the top 5 most relevant results
4. Each result must have: displayName, street, city, county, postcode, lat, lon
5. If postcode is missing, use empty string
6. Make sure displayName is clear and readable`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: `User search query: "${query}"

Geocoding API results:
${JSON.stringify(rawResults, null, 2)}

Return the top 5 most relevant addresses formatted for Irish users.`,
    });

    const aiResults = JSON.parse(response.text || "[]");
    
    return aiResults.slice(0, 5).map((result: any) => ({
      displayName: result.displayName || result.display_name || '',
      street: result.street || result.road || '',
      city: result.city || result.town || result.village || '',
      county: result.county || result.state || '',
      postcode: result.postcode || result.postal_code || '',
      lat: parseFloat(result.lat) || 0,
      lon: parseFloat(result.lon) || 0,
    }));
  } catch (error) {
    console.error("Address search error:", error);
    
    // Fallback to raw Nominatim results if AI fails
    return rawResults.slice(0, 5).map((result: any) => ({
      displayName: result.display_name,
      street: result.address?.road || '',
      city: result.address?.city || result.address?.town || result.address?.village || '',
      county: result.address?.county || result.address?.state || '',
      postcode: result.address?.postcode || '',
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    }));
  }
}
