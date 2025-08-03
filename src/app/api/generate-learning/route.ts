import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

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

    // Truncate if too long
    const maxInputLength = 80000; // Leave more room for multiple prompts
    if (combinedText.length > maxInputLength) {
      combinedText = combinedText.substring(0, maxInputLength) + "\n\n[Text truncated due to length limits]";
    }

    // Generate concise study materials
    const prompts = {
      flashcards: `Create 15-20 flashcards for studying this material. Format each as:

**Q:** Question/concept to test
**A:** Concise answer (1-2 sentences max)

---

Focus on:
- Key concepts and definitions
- Important formulas or facts
- Critical relationships between ideas
- Things students often forget

Keep answers SHORT and focused. No long explanations.

Source Material: ${combinedText}`,

      mcq: `Generate exactly 10 multiple choice questions. Format as:

**1. Question here?**
A) Option A
B) Option B  
C) Option C
D) Option D

*Answer: C*

---

**2. Next question?**
[same format]

Focus on testing understanding, not memorization. Include mix of easy/medium/hard questions. NO explanations - just questions and answers.

Source Material: ${combinedText}`,

      summary: `Create a bulleted summary of the 8-12 most important takeaways. Format as:

## Key Takeaways

• First important point (1 sentence)
• Second important point (1 sentence)
• [continue...]

Be extremely concise. Each point should be ONE sentence that captures something essential to remember.

Source Material: ${combinedText}`,

      definitions: `Extract 15-20 key terms and provide ultra-concise definitions. Format as:

**Term**: Definition in 5-10 words max
**Another Term**: Another super brief definition

Focus on:
- Technical terms
- Important concepts
- Formulas/equations (if any)
- Proper nouns

Keep definitions EXTREMELY short. No examples or elaboration.

Source Material: ${combinedText}`
    };

    // Helper function with retry logic
    const makeRequest = async (type: string, prompt: string, retryCount = 0): Promise<[string, string]> => {
      try {
        const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CEREBRAS_API_KEY}`,
          },
          body: JSON.stringify({
            model: "qwen-3-235b-a22b-instruct-2507",
            messages: [
              {
                role: "system",
                content: "You are a study materials creator. Generate CONCISE study aids - flashcards, quiz questions, summaries, and definitions. Follow formatting exactly. Be brief and focused. No long explanations or verbose content."
              },
              {
                role: "user",
                content: prompt
              }
            ]
          }),
        });

        if (response.status === 429 && retryCount < 3) {
          // Rate limited, wait and retry
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Rate limited for ${type}, retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return makeRequest(type, prompt, retryCount + 1);
        }

        if (!response.ok) {
          throw new Error(`Failed to generate ${type}: ${response.status}`);
        }

        const data = await response.json();
        return [type, data.choices[0].message.content];
      } catch (error) {
        if (retryCount < 2) {
          console.log(`Error generating ${type}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return makeRequest(type, prompt, retryCount + 1);
        }
        throw error;
      }
    };

    // Make sequential requests with delays to avoid rate limits
    const responses: [string, string][] = [];
    const entries = Object.entries(prompts);
    
    for (let i = 0; i < entries.length; i++) {
      const [type, prompt] = entries[i];
      
      try {
        const result = await makeRequest(type, prompt);
        responses.push(result);
        
        // Add delay between requests to respect rate limits
        if (i < entries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to generate ${type}:`, error);
        // Continue with other requests, use fallback content
        responses.push([type, `## ${type.charAt(0).toUpperCase() + type.slice(1)}\n\nContent generation failed. Please try again.`]);
      }
    }

    // Convert responses to object
    const learningMaterials = Object.fromEntries(responses);

    return NextResponse.json(learningMaterials);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
