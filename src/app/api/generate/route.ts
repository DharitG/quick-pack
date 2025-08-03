import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const pageLimit = formData.get('pageLimit') as string;

    let combinedText = "";

    for (const file of files) {
      if (file.type === 'application/pdf') {
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdf(buffer);
        combinedText += data.text;
      } else {
        combinedText += await file.text();
      }
    }

    // With Qwen 3 235B having 131K context, we can handle much larger documents
    const maxInputLength = 100000; // Conservative limit to leave room for system prompt and response
    if (combinedText.length > maxInputLength) {
      combinedText = combinedText.substring(0, maxInputLength) + "\n\n[Text truncated due to length limits]";
    }

    const cerebrasResponse = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY || "YOUR_API_KEY"}`,
      },
      body: JSON.stringify({
        model: "qwen-3-235b-a22b-instruct-2507",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates rich markdown/latex documents based on the provided text. Do not include any introductory text, commentary, or any other text outside of the final markdown document."
          },
          {
            role: "user",
            content: `
              Based on the following text, generate a ${pageLimit}-page explainer in rich markdown/latex format.
              Text: ${combinedText}
            `
          }
        ]
      }),
    });

    if (!cerebrasResponse.ok) {
      const errorText = await cerebrasResponse.text();
      console.error('Cerebras API Error:', cerebrasResponse.status, errorText);
      throw new Error(`Failed to generate content from Cerebras: ${cerebrasResponse.status} - ${errorText}`);
    }

    const cerebrasData = await cerebrasResponse.json();
    const content = cerebrasData.choices[0].message.content;

    return NextResponse.json({
      content: content,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
