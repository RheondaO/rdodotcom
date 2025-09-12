import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateFitnessInsights(fitnessData: any): Promise<any> {
  try {
    const prompt = `
You are a fitness and nutrition expert AI. Analyze the following fitness data and provide personalized insights, recommendations, and progress analysis.

Fitness Data:
- Recent Workouts: ${JSON.stringify(fitnessData.workouts, null, 2)}
- Body Weight History: ${JSON.stringify(fitnessData.weights, null, 2)}
- Active Fitness Goals: ${JSON.stringify(fitnessData.goals, null, 2)}
- Recent Nutrition Entries: ${JSON.stringify(fitnessData.nutrition, null, 2)}
- Meal Plans: ${JSON.stringify(fitnessData.mealPlans, null, 2)}
- Diet Goals: ${JSON.stringify(fitnessData.dietGoals, null, 2)}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "Brief overall assessment of fitness progress and health",
  "recommendations": ["Array of 4-6 specific, actionable recommendations"],
  "progress": {
    "workoutsThisWeek": "Number of workouts this week",
    "weightTrend": "Description of weight trend (gaining/losing/stable)",
    "goalProgress": "Assessment of goal progress",
    "mealPlanAdherence": "Percentage of meal plan adherence"
  },
  "insights": {
    "strengths": ["Array of current strengths in fitness routine"],
    "areasForImprovement": ["Array of areas that need attention"],
    "nutritionAnalysis": "Analysis of nutrition patterns and quality",
    "workoutEffectiveness": "Assessment of workout routine effectiveness"
  }
}

Focus on being encouraging while providing actionable advice. Base all recommendations on the actual data provided.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const rawJson = response.text;
    
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    console.error('Error generating fitness insights with Gemini:', error);
    throw new Error(`Failed to analyze fitness data: ${error}`);
  }
}

export async function analyzeSentiment(text: string): Promise<{rating: number, confidence: number}> {
  try {
    const systemPrompt = `You are a sentiment analysis expert. 
Analyze the sentiment of the text and provide a rating
from 1 to 5 stars and a confidence score between 0 and 1.
Respond with JSON in this format: 
{'rating': number, 'confidence': number}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rating: { type: "number" },
            confidence: { type: "number" },
          },
          required: ["rating", "confidence"],
        },
      },
      contents: text,
    });

    const rawJson = response.text;

    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    throw new Error(`Failed to analyze sentiment: ${error}`);
  }
}