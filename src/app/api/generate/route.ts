import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "YOUR_API_KEY");

function fileToGenerativePart(base64: string, mimeType: string): Part {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

export async function POST(req: Request) {
  try {
    const { files, pageLimit } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: "You are a helpful assistant that creates detailed, structured outlines and specifications based on the provided content. Do not add any commentary or introductory text.",
    });

    const imageParts = files.map((file: { base64: string, mimeType: string }) =>
      fileToGenerativePart(file.base64, file.mimeType)
    );

    const prompt = `
      Based on the following files, generate a detailed spec of all the topics that must be generated.
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const spec = response.text();

    const cerebrasResponse = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY || "YOUR_API_KEY"}`,
      },
      body: JSON.stringify({
        model: "qwen-3-32b",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates rich markdown/latex documents based on a provided specification. Do not include any introductory text, commentary, or any other text outside of the final markdown document."
          },
          {
            role: "user",
            content: `
              Based on the following spec, generate a ${pageLimit}-page explainer in rich markdown/latex format.
              Spec: ${spec}
            `
          }
        ]
      }),
    });

    if (!cerebrasResponse.ok) {
      throw new Error('Failed to generate content from Cerebras');
    }

    const cerebrasData = await cerebrasResponse.json();
    const content = cerebrasData.choices[0].message.content;

    return NextResponse.json({
      spec: spec,
      content: content,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
