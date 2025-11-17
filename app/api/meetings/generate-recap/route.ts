
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { meetingId, transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that generates comprehensive meeting recaps. Based on the meeting transcript provided, create a detailed recap that includes:

1. Meeting Summary (2-3 sentences overview)
2. Key Discussion Points (bulleted list of main topics discussed)
3. Action Points (specific tasks or commitments mentioned)
4. Next Steps (any follow-up actions or next meetings planned)
5. Important Decisions Made (if any)

Format your response in clear sections with proper headers. Be concise but thorough, focusing on actionable information and key takeaways.

Respond with raw JSON only in this exact format:
{
  "summary": "Brief 2-3 sentence overview of the meeting",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "actionItems": ["Action 1", "Action 2"],
  "nextSteps": ["Step 1", "Step 2"],
  "decisions": ["Decision 1", "Decision 2"]
}

Do not include code blocks, markdown, or any other formatting.`
          },
          {
            role: 'user',
            content: `Please analyze this meeting transcript and provide a comprehensive recap:\n\n${transcript}`
          }
        ],
        stream: true,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        
        let buffer = '';
        let partialRead = '';
        
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            
            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split('\n');
            partialRead = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer);
                    
                    // Format the recap for display
                    const formattedRecap = `MEETING SUMMARY:
${finalResult.summary || 'No summary available'}

KEY DISCUSSION POINTS:
${(finalResult.keyPoints || []).map((point: string) => `• ${point}`).join('\n')}

ACTION ITEMS:
${(finalResult.actionItems || []).map((item: string) => `• ${item}`).join('\n')}

NEXT STEPS:
${(finalResult.nextSteps || []).map((step: string) => `• ${step}`).join('\n')}

DECISIONS MADE:
${(finalResult.decisions || []).map((decision: string) => `• ${decision}`).join('\n')}`;

                    // Save recap to database
                    if (meetingId) {
                      await prisma.meeting.update({
                        where: { id: meetingId },
                        data: { recap: formattedRecap },
                      });
                    }

                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: formattedRecap
                    });
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                    return;
                  } catch (e) {
                    console.error('Error parsing final JSON:', e);
                    controller.error(new Error('Failed to parse LLM response'));
                    return;
                  }
                }
                
                try {
                  const parsed = JSON.parse(data);
                  buffer += parsed.choices?.[0]?.delta?.content || '';
                  
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Generating recap'
                  });
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error generating recap:', error);
    return NextResponse.json(
      { error: 'Failed to generate recap' },
      { status: 500 }
    );
  }
}
