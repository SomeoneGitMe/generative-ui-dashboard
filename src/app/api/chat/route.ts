import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_sales_chart",
          description: "Generates a bar chart for sales data. Use when the user asks for sales, revenue, or data visualization.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "The title of the chart" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "e.g., Q1, Q2, January" },
                    value: { type: "number", description: "The numerical value, e.g., revenue in dollars" }
                  }
                }
              }
            },
            required: ["title", "data"] // FIX: Added required fields for strict schemas
          }
        }
      }
    ];

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: "You are an AI dashboard assistant. When users ask for data, revenue, or sales, ALWAYS use the generate_sales_chart tool to visualize it. If the user does not provide specific numbers, generate realistic random sales data (e.g., between 1000 and 15000) for the requested time periods." },
        ...messages
      ],
      tools: tools as any,
      temperature: 0.4,
    });

    const responseMessage: any = completion.choices[0].message;

    // If the AI called the tool, extract the chart data
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall: any = responseMessage.tool_calls[0];
      if (toolCall.function.name === 'generate_sales_chart') {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          return NextResponse.json({ toolCall: { name: 'generate_sales_chart', args } });
        } catch (parseError) {
          console.error('[Chat] JSON Parse Error for Tool Args:', toolCall.function.arguments);
          return NextResponse.json({ error: 'AI returned malformed chart data.' }, { status: 500 });
        }
      }
    }

    // Otherwise, return standard text
    return NextResponse.json({ text: responseMessage.content });

  } catch (error: any) {
    console.error('[Chat] Catch Block Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}