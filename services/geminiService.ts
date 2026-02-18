
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * SMART EXTRACTION
 * Parses a natural language string into structured task data.
 */
export const extractTaskDetails = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract task information from this text: "${input}". 
      If no duration is specified, estimate based on the task type.
      If no priority is clear, assign one between 0.0 (low) and 1.0 (high).
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            duration: { type: Type.STRING, description: "e.g. '30m', '2h', '1d'" },
            priority: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "duration", "priority"]
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
 * TASK SUGGESTIONS
 * Generates contextual attributes for a new task using Gemini.
 */
export const getTaskSuggestions = async (title: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following task and suggest smart attributes: "${title}".
      Suggest attributes like duration (e.g., '1h'), category (e.g., 'Work'), priority (0.0 to 1.0), deadline (ISO date), or subtasks.
      Return a JSON array of suggestions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              field: { type: Type.STRING, description: "One of: duration, category, priority, deadline, subtasks" },
              value: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              metadata: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Required for 'subtasks' field" }
            },
            required: ["field", "value", "reasoning"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Suggestions_Error", e);
    return [];
  }
};

/**
 * DECOMPOSE PROJECT
 * Breaks a high-level goal into a structured roadmap of tasks.
 */
export const decomposeProject = async (goal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Plan this project/goal: "${goal}". 
      Return a JSON array of task objects. Each object must have:
      - title (string)
      - category (string)
      - priority (float 0-1)
      - estimatedDuration (string)
      - reasoning (brief explanation)
      - subtasks (array of strings)`,
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
    console.error("Decomposition_Error", e);
    return [];
  }
};

/**
 * STRATEGIC BRIEFING
 * Analyzes entire task list to provide a tactical summary.
 */
export const generateStrategicBriefing = async (tasks: Task[]) => {
  const context = tasks.map(t => `- ${t.title} (Status: ${t.status}, Priority: ${t.priority})`).join("\n");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `System: You are Zenith, a tactical productivity strategist. 
      Analyze the current workload and provide a sharp, 3-sentence morning briefing.
      Highlight the biggest bottleneck and the highest-leverage win.
      Current Workload:\n${context}`,
    });
    return response.text;
  } catch (e) {
    return "Strategic synchronization in progress. Focus on your highest priority task.";
  }
};

/**
 * SEARCH GROUNDED RESEARCH
 * Uses Google Search to find real-world info for a task.
 */
export const performTaskResearch = async (taskTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Research this task for me and provide actionable links and data: "${taskTitle}"`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const text = response.text;
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Reference",
      uri: chunk.web?.uri || "#"
    })) || [];

    return { text, links };
  } catch (e) {
    console.error("Research_Error", e);
    return { text: "Research module currently offline.", links: [] };
  }
};
