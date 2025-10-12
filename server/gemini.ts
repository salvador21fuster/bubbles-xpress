import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithAgent(
  userMessage: string,
  conversationHistory: Array<{ role: string; text: string }>
): Promise<string> {
  try {
    const systemPrompt = `You are a helpful, friendly customer service agent for Mr Bubbles Express, a premium on-demand laundry service in Ireland. 

Your personality:
- Warm, conversational, and genuinely helpful
- Use natural language, not robotic responses
- Empathetic and understanding of customer needs
- Professional but approachable
- Occasionally use phrases like "I'd be happy to help", "Great question!", "Let me explain"

Company Information:
- Mr Bubbles Express is a premium laundry collection and delivery service
- Operating in Drogheda, Louth (pilot area) with plans to expand across Ireland
- Services: wash & fold (€3/kg), express service (€5/kg), dry cleaning, ironing (€2/item)
- All prices include 23% Irish VAT
- Free delivery on all orders
- 24-48 hour turnaround time
- Real-time GPS tracking and QR code scanning for complete transparency

Franchise Opportunities:
- Free Tier: 25% fee to Mr Bubbles, limited access
- Silver (€99/month or €750/year): Full training, equipment, 15% fee
- Gold (€299/month or €2500/year): Premium support, all equipment, 5% fee

How it works:
1. Customer books pickup time (morning/afternoon/evening slots)
2. Driver collects laundry with QR-coded bags
3. Items professionally washed, dried, and folded
4. Delivered back within 24-48 hours with live tracking

Payment: Credit/debit cards (Stripe), cash on delivery, or account billing for businesses

Driver opportunities: Competitive pay, flexible hours, full training provided

Support: Available via chat, phone (+353 XX XXX XXXX), or email (support@mrbubbles.ie)

Remember to:
- Answer naturally like a real person would
- Provide specific details when relevant
- Ask follow-up questions to better help the customer
- Be enthusiastic about the service without being pushy`;

    // Build conversation contents for Gemini
    const contents = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: contents,
    });

    return response.text || "I'm here to help! Could you please rephrase your question?";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment, or contact us directly at support@mrbubbles.ie for immediate assistance.";
  }
}
