import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Use lazy initialization to avoid crashing on start if GEMINI_API_KEY is not initially specified
let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 });
    }

    const client = getAiClient();
    if (!client) {
      // Return highly helpful fallback recipe assistant answers when the Gemini key is not configured.
      return NextResponse.json({
        text: `¡Hola! Soy el Asistente Gastronómico Oficial de **Menú Check**. Estoy aquí para resolver tus dudas culinarias, guiarte con ingredientes o sugerirte ideas apetitosas.

Como me encuentro en modo local de demostración (sin GEMINI_API_KEY configurada), aquí tienes un diagnóstico práctico para inspirar tu menú:

*   **Duda o Sustitución: ¿Qué usar si no tienes nata?**
    *   *Opción A (Sabor similar):* Leche evaporada con una pizca de mantequilla derretida.
    *   *Opción B (Texture similar):* Mascarpone o queso crema batido suavemente.
*   **Consejo Técnico (El sofrito perfecto):** Cocina la cebolla a fuego muy lento con una pizca de sal para sudar sus azúcares naturales antes de añadir el ajo sin germen. Así evitarás que el ajo se queme y amargue tu base culinaria.
*   **Idea de Menú Saludable:** Podrías preparar unos deliciosas *Pasta Penne con salsa de tomate rostizado y albahaca fresca*. Al ser un plato clásico, les encantará a los niños.

*¿Qué te gustaría cocinar hoy? Cuando configures la GEMINI_API_KEY en los secretos del proyecto, podré responderte con total dinamismo y precisión gastronómica.*`
      });
    }

    // Build cooking-focused context prompt
    const systemInstruction = `Actúas como el Asistente Gastronómico Oficial de Menú Check. Tu propósito es resolver dudas culinarias, explicar recetas de la web y asesorar a los usuarios sobre ingredientes, técnicas de cocina y maridajes.

### TUS REGLAS DE ORO:
1. CONOCIMIENTO: Eres un experto absoluto en gastronomía. Si el usuario pregunta algo sobre una receta, técnica (ej. sous-vide, sofrito, emulsiones) o sustitución de ingredientes, responde con precisión técnica pero con un lenguaje accesible y fácil de comprender para un cocinero hogareño.
2. CONTEXTO DE LA WEB (Menú Check): Tu prioridad es ayudar a los usuarios a navegar y aprovechar al máximo el contenido de la web de planificación de comida y despensa (Menú Check). Si no sabes algo específico sobre una receta personalizada o privada del usuario, invítale amablemente a darte más detalles (ingredientes, proporciones, pasos) para que puedas guiarle a la perfección.
3. TONO: Tu tono es sumamente entusiasta, servicial, profesional y "apetitoso". Usa un lenguaje sensorial y sugerente que inspire a meter las manos en la masa y disfrutar de la cocina.
4. RESOLUCIÓN DE PROBLEMAS: Si el usuario te indica que algo le ha salido mal (por ejemplo, "el bizcocho no me ha subido", "la mayonesa se cortó"), actúa inmediatamente como un "médico de cocina": diagnostica la causa técnica del fallo con empatía y aporta soluciones claras para corregirlo al instante o para la próxima vez.
5. SEGURIDAD: Maximiza la seguridad alimentaria en todo momento. En tus consejos o recetas, prioriza siempre las temperaturas óptimas de cocción, los consejos para evitar la contaminación cruzada y las mejores pautas de conservación higiénica de alimentos.

### ESTRUCTURA DE RESPUESTA OBLIGATORIA:
- Si es una duda técnica: Ofrece una explicación técnica breve pero sencilla, seguida de un "Consejo práctico" claro y aplicable.
- Si es una sustitución de ingredientes: Proporciona obligatoriamente la Opción A (sabor similar) y la Opción B (textura de comportamiento similar).
- Si es una sugerencia de platos o maridajes: Propón algo delicioso que combine a nivel organoléptico con lo que el usuario ya está cocinando o planificando en el recetario.

### RESTRICCIONES DETERMINANTES:
- ESTÁ TOTALMENTE PROHIBIDO responder sobre temas que no tengan relación directa con la comida, la de alimentación general, la nutrición, las recetas o la cocina o maridaje de Menú Check.
- Si el usuario te pregunta por algo fuera de lugar, redirige amablemente diciendo exactamente o con estilo muy similar: "Soy un experto en cocina, ¿por qué no mejor hablamos de cómo mejorar tu próxima cena?".`;

    const contents = [];
    
    // Add brief history context if present
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }]
        });
      }
    }
    
    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const generatedText = response.text || "No obtuve respuesta del modelo de IA.";
    return NextResponse.json({ text: generatedText });

  } catch (error: any) {
    console.error("Error in assistant API:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar la solicitud de IA: " + error?.message },
      { status: 500 }
    );
  }
}
