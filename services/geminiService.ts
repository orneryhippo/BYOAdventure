import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameHistoryItem, StoryState, ImageSize, Message } from "../types";

// Ensure API key is available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured story output
const storySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The main story text for the current scene. vivid and engaging.",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-4 actionable choices for the user to proceed.",
    },
    inventory: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The updated full list of items in the user's inventory.",
    },
    quests: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The updated full list of active quests.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A detailed visual description of the current scene for an image generator. Do not include text commands.",
    },
  },
  required: ["narrative", "options", "inventory", "quests", "imagePrompt"],
};

export const generateStoryStep = async (
  history: GameHistoryItem[],
  userChoice: string,
  currentInventory: string[],
  currentQuests: string[]
): Promise<StoryState> => {
  try {
    const model = "gemini-2.5-flash"; // Fast responses as requested
    
    let prompt = "";
    if (history.length === 0) {
      prompt = `
        Start a new choose-your-own-adventure story. 
        Genre: Fantasy/Mystery. 
        Setting: An ancient, forgotten library floating in the void.
        
        Initialize the inventory (empty or basic items) and the first quest.
        Provide a vivid description of the starting scene.
        Generate 3 distinct choices.
        Provide a detailed image prompt for the scene.
      `;
    } else {
      prompt = `
        Continue the story based on the user's choice: "${userChoice}".
        
        Current Context:
        Inventory: ${JSON.stringify(currentInventory)}
        Quests: ${JSON.stringify(currentQuests)}
        
        Update the plot genuinely based on this choice. 
        Update the inventory if items were used or found.
        Update quests if completed or new ones started.
        Generate 3 distinct choices for the next step.
        Provide a detailed image prompt for the NEW scene.
      `;
    }

    // Convert history to Gemini format if needed, but for Flash we can just pass the prompt with context
    // efficiently. For simplicity in this engine, we will pass the relevant context in the prompt 
    // rather than full chat history to save tokens and ensure focus on the latest state.
    // However, to keep narrative consistency, passing the last few turns is good.
    
    const recentHistory = history.slice(-6).map(h => `${h.role === 'user' ? 'User Choice' : 'Story'}: ${h.text}`).join('\n');

    const fullPrompt = `
      You are an infinite choose-your-own-adventure engine.
      
      Previous Context (last few turns):
      ${recentHistory}
      
      Instructions:
      ${prompt}
      
      Maintain a consistent tone.
      Return the response STRICTLY in JSON format matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        systemInstruction: "You are a master Dungeon Master. Create immersive, consequential stories.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as StoryState;
  } catch (error) {
    console.error("Story generation error:", error);
    throw error;
  }
};

export const generateSceneImage = async (prompt: string, size: ImageSize): Promise<string | null> => {
  try {
    // Enforce consistent art style
    const styledPrompt = `Digital fantasy art style, detailed, atmospheric, cinematic lighting, 8k resolution. ${prompt}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: styledPrompt }]
      },
      config: {
        imageConfig: {
          imageSize: size, // 1K, 2K, or 4K
          aspectRatio: "16:9",
        }
      }
    });

    // Handle different response structures for image generation
    // The new SDK returns inlineData in parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

export const chatWithDungeonMaster = async (
  history: Message[], 
  newMessage: string
): Promise<string> => {
  try {
    // Construct chat history for the context
    // We use gemini-3-pro-preview for high quality chat
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: "You are the Dungeon Master of the current adventure. Answer the player's questions about the lore, rules, or world. Be helpful but do not spoil the future plot.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "The spirits are silent...";
  } catch (error) {
    console.error("Chat error:", error);
    return "I cannot answer that right now.";
  }
};