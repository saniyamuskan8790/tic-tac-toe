
import { GoogleGenAI, Type } from "@google/genai";
import { Player, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIMove = async (
  board: Player[],
  aiPlayer: 'X' | 'O',
  humanPlayer: 'X' | 'O'
): Promise<AIResponse> => {
  // Represent board as string for the prompt
  const boardStr = board.map((cell, idx) => cell === null ? idx.toString() : cell).join('|');
  
  const systemInstruction = `
    You are a professional Tic Tac Toe AI named "Gemini Prime". 
    Your goal is to win or at least draw. 
    You are also a bit of a cheeky commentator. 
    You must analyze the board state provided as a 0-indexed array where numbers represent empty slots.
    The current board state is: ${boardStr}
    You are playing as: ${aiPlayer}
    Your opponent is: ${humanPlayer}

    Provide your response in JSON format.
    The "move" must be an integer (0-8) representing an empty slot.
    The "commentary" should be a short, engaging sentence about your move or the current game state.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Analyze the board and make the best move.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: {
              type: Type.INTEGER,
              description: "The index of the cell to play (0-8)."
            },
            commentary: {
              type: Type.STRING,
              description: "A short, witty comment about the move."
            }
          },
          required: ["move", "commentary"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as AIResponse;
  } catch (error) {
    console.error("Gemini AI move error:", error);
    // Fallback: Pick first available slot
    const available = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
    return {
      move: available[0],
      commentary: "I'm having a bit of a processing lag, but I'll still beat you!"
    };
  }
};

export const getCommentary = async (
  board: Player[],
  winner: Player | 'Draw',
  lastPlayer: Player
): Promise<string> => {
  const boardStr = board.map(cell => cell === null ? "-" : cell).join("");
  const prompt = `
    The Tic Tac Toe game just ended. 
    Board state: ${boardStr}
    Winner: ${winner}
    Last player who moved: ${lastPlayer}
    Provide a final witty comment about the outcome. Keep it under 20 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a witty game commentator.",
      }
    });
    return response.text.trim();
  } catch (err) {
    return "Great game!";
  }
};
