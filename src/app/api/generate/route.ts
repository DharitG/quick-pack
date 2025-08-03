import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "YOUR_API_KEY");

export async function POST(req: Request) {
  try {
    const { textInput, urlInput, youtubeInput, pageLimit } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = `
      Based on the following input, generate a detailed spec of all the topics that must be generated.
      Input: ${textInput || urlInput || youtubeInput}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const spec = response.text();

    const cerebrasResponse = await fetch("https://api.cerebras.com/v1/generate", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY || "YOUR_API_KEY"}`,
      },
      body: JSON.stringify({
        model: "Qwen-3-32B",
        prompt: `
          Based on the following spec, generate a ${pageLimit}-page explainer in rich markdown/latex format.
          Spec: ${spec}
        `,
      }),
    });

    if (!cerebrasResponse.ok) {
      throw new Error('Failed to generate content from Cerebras');
    }

    const cerebrasData = await cerebrasResponse.json();

    return NextResponse.json({
      spec: spec,
      content: cerebrasData.content,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
