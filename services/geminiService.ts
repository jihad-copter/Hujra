
import { GoogleGenAI } from "@google/genai";
import { Student } from "../types";

export const analyzeStudentProgress = async (student: Student) => {
  // Fix: Initializing GoogleGenAI following strict guidelines using named parameter and direct env access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    بۆ ئەم خوێندکارەی حوجرە (فەقێ) هەڵسەنگاندنێکی کورت بکە بە زمانی کوردی:
    ناو: ${student.fullName}
    کتێبەکان: ${student.currentBooks.map(b => b.name).join(", ")}
    باری دارایی: ${student.familyFinancialStatus}
    باری تەندروستی: ${student.healthStatus}
    پێشنیار بکە کە چۆن دەتوانرێت زیاتر هاوکاری بکرێت لە ڕووی زانستی و کۆمەڵایەتییەوە.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Fix: Accessing .text property directly as per guidelines (not as a method)
    return response.text;
  } catch (error) {
    console.error("Error generating analysis:", error);
    return "نەتوانرا شیکردنەوەکە ئەنجام بدرێت.";
  }
};
