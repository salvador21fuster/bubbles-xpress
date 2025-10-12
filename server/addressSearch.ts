import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Free geocoding service - OpenStreetMap Nominatim with smart fallback
async function searchAddressNominatim(query: string): Promise<any[]> {
  try {
    // Try full query first
    const fullResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        countrycodes: 'ie', // Ireland only
        limit: '10'
      }),
      {
        headers: {
          'User-Agent': 'MrBubblesExpress/1.0'
        }
      }
    );
    
    let data = await fullResponse.json();
    
    // If no results, try multiple fallback strategies
    if (data.length === 0) {
      const parts = query.toLowerCase().split(/[\s,]+/);
      
      // Remove common housing terms that aren't in geocoding databases
      const housingTerms = ['villas', 'estate', 'apartments', 'apts', 'complex', 'court', 'gardens'];
      const filtered = parts.filter(p => !housingTerms.includes(p));
      
      if (filtered.length >= 2 && filtered.join(' ') !== query.toLowerCase()) {
        const fallbackQuery = filtered.join(' ');
        console.log(`No results for "${query}", trying without housing terms: "${fallbackQuery}"`);
        
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: fallbackQuery,
            format: 'json',
            addressdetails: '1',
            countrycodes: 'ie',
            limit: '10'
          }),
          {
            headers: {
              'User-Agent': 'MrBubblesExpress/1.0'
            }
          }
        );
        data = await fallbackResponse.json();
      }
      
      // If still no results, try just the last word (usually city name)
      if (data.length === 0 && parts.length > 1) {
        const cityQuery = parts[parts.length - 1];
        console.log(`Still no results, trying just city: "${cityQuery}"`);
        
        const cityResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: cityQuery,
            format: 'json',
            addressdetails: '1',
            countrycodes: 'ie',
            limit: '10'
          }),
          {
            headers: {
              'User-Agent': 'MrBubblesExpress/1.0'
            }
          }
        );
        data = await cityResponse.json();
      }
    }
    
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
    console.log(`No address results found for: "${query}"`);
    return [];
  }

  console.log(`Found ${rawResults.length} addresses for: "${query}"`);

  // Format Nominatim results directly - simpler and more reliable
  return rawResults.slice(0, 5).map((result: any) => {
    const address = result.address || {};
    const street = address.road || address.street || '';
    const houseNumber = address.house_number || '';
    const city = address.city || address.town || address.village || address.suburb || '';
    const county = address.county || address.state || '';
    const postcode = address.postcode || '';
    
    // Build a nice display name
    let displayParts = [];
    if (houseNumber && street) {
      displayParts.push(`${houseNumber} ${street}`);
    } else if (street) {
      displayParts.push(street);
    }
    if (city) {
      displayParts.push(city);
    }
    if (county && county !== city) {
      displayParts.push(county);
    }
    
    const displayName = displayParts.length > 0 
      ? displayParts.join(', ')
      : result.display_name;

    return {
      displayName,
      street,
      city,
      county,
      postcode,
      lat: parseFloat(result.lat) || 0,
      lon: parseFloat(result.lon) || 0,
    };
  });
}
