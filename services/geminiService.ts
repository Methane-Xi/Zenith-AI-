import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskPriority, AIPreferences } from "../types";

/**
 * ZENITH NEURAL CORE - PRODUCTION GRADE
 * Using @google/genai with strict environment handling.
 */

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * SMART EXTRACTION & ML PREDICTION
 */
export const extractTaskDetails = async (input: string) => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Extract task information and predict ML attributes from this text: "${input}". 
      Return JSON.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            duration: { type: Type.STRING },
            priority: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            mlPrediction: {
              type: Type.OBJECT,
              properties: {
                predictedCompletionTime: { type: Type.STRING },
                riskScore: { type: Type.NUMBER },
                suggestedPriority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                autoCategory: { type: Type.STRING }
              },
              required: ["predictedCompletionTime", "riskScore", "suggestedPriority", "autoCategory"]
            }
          },
          required: ["title", "duration", "priority", "mlPrediction"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Extraction_Error", e);
    return null;
  }
};

/**
 * ADVANCED TASK SUMMARIZATION
 */
export const generateTaskSummaries = async (task: Task, prefs: AIPreferences) => {
  const ai = getAI();
  if (!ai) return null;
  
  const prompt = `Generate task summaries for: "${task.title}". 
  Context: ${task.description || "No description"}.
  User Preference: Style=${prefs.summaryStyle}, Level=${prefs.languageLevel}.
  
  Requirements:
  1. Standard Summary: Professional and concise.
  2. Simplified Summary: Extremely simple language for low-literacy users.
  3. Bullet Summary: Structured key points.
  4. Readability Score: 0-100.
  
  Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            standardSummary: { type: Type.STRING },
            simplifiedSummary: { type: Type.STRING },
            bulletSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
            readabilityScore: { type: Type.NUMBER }
          },
          required: ["standardSummary", "simplifiedSummary", "bulletSummary", "readabilityScore"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Summarization_Error", e);
    return null;
  }
};

/**
 * ANTIGRAVITY TERMINAL QUERY
 */
export const queryAntigravity = async (query: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = getAI();
  if (!ai) return "ERR: NEURAL_CORE_OFFLINE";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [...history, { role: 'user', parts: [{ text: query }] }],
      config: {
        systemInstruction: "You are ANTIGRAVITY, an elite AI systems architect. Tone: cold, precise, technical. Use monospace for code. You are embedded in the Zenith Enclave.",
        temperature: 0.3,
      }
    });
    return response.text;
  } catch (e) {
    console.error("Antigravity_Error", e);
    return "ERR: NEURAL_LINK_FAULT. Check API status.";
  }
};

export const getTaskSuggestions = async (title: string) => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Analyze: "${title}". Suggest smart attributes. Return JSON array.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              field: { type: Type.STRING },
              value: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              metadata: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["field", "value", "reasoning"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const decomposeProject = async (goal: string) => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Plan project: "${goal}". Return JSON array.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              priority: { type: Type.NUMBER },
              estimatedDuration: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "category", "priority", "estimatedDuration"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const generateStrategicBriefing = async (tasks: Task[]) => {
  const ai = getAI();
  if (!ai) return "Strategic synchronization offline.";
  const context = tasks.map(t => `- ${t.title} (Status: ${t.status})`).join("\n");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Analyze and provide a 3-sentence tactical briefing.\n${context}` }] }],
    });
    return response.text;
  } catch (e) {
    return "Strategic synchronization in progress.";
  }
};

export const performTaskResearch = async (taskTitle: string) => {
  const ai = getAI();
  if (!ai) return { text: "Research module offline.", links: [] };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `Research and provide actionable info for: "${taskTitle}"` }] }],
      config: { tools: [{ googleSearch: {} }] }
    });
    const text = response.text;
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Reference",
      uri: chunk.web?.uri || "#"
    })) || [];
    return { text, links };
  } catch (e) {
    return { text: "Research module offline.", links: [] };
  }
};