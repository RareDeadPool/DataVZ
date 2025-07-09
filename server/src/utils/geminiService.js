const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are a data visualization assistant. When given a user request and data, respond ONLY with a JSON object for the following chart config format:

{
  "type": "bar", // chart type (bar, line, pie, etc.)
  "xKey": "Category", // x-axis key
  "yKey": "Value", // y-axis key
  "data": [
    { "Category": "A", "Value": 10 },
    { "Category": "B", "Value": 20 },
    { "Category": "C", "Value": 30 }
  ]
}

Do not include any code, explanation, or markdown. Only output the JSON config.`;

async function askGemini(prompt, data) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  let userPrompt = prompt;
  if (data) {
    userPrompt += `\nHere is the data: ${JSON.stringify(data)}`;
  }
  const result = await model.generateContent({
    contents: [
      { parts: [{ text: SYSTEM_PROMPT + "\n" + userPrompt }] }
    ]
  });
  // Try to extract JSON from the response
  const text = result.response.text();
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    const chartConfig = JSON.parse(jsonString);
    return { chartConfig };
  } catch (e) {
    return { error: 'Failed to parse chart config from AI response', raw: text };
  }
}

module.exports = { askGemini }; 