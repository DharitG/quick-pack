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
            content: `You are an educational content specialist that transforms source material into polished learning documents. 

CRITICAL FORMATTING REQUIREMENTS:
- Start directly with content - NO introductory text, titles like "Introduction to..." or meta-commentary
- Use clear, simple language - explain complex concepts in understandable terms
- Structure content logically with proper headings (##, ###)
- Use LaTeX math notation: inline with $...$, display with $$...$$
- Include relevant examples, diagrams (using markdown), and practice problems
- Use bullet points, numbered lists, and tables for clarity
- Add code blocks with proper syntax highlighting when relevant

MATH/LATEX GUIDELINES:
- Inline math: $E = mc^2$, $\\frac{1}{2}mv^2$
- Display math: $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$
- Use \\text{} for text in equations: $F = m \\cdot \\text{acceleration}$
- Escape backslashes properly: \\\\, \\alpha, \\beta, \\sum, \\int

CONTENT STRUCTURE:
- Break into logical sections with clear headings
- Include visual elements (tables, lists, diagrams)
- Add practice problems or examples where appropriate
- End sections with key takeaways or summaries
- Use > blockquotes for important notes or definitions

FORBIDDEN:
- No course titles, instructor names, or meta information
- No "Welcome to..." or "This document covers..." introductions  
- No "Prepared as a..." or similar meta-commentary
- No excessive formatting symbols or decorative elements`
          },
          {
            role: "user",
            content: `Transform the following source material into a comprehensive ${pageLimit}-page educational document. Use rich markdown with proper LaTeX math formatting. Start directly with substantive content.

Source Material:
${combinedText}`
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
