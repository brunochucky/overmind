
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

    // Get current highlight context from settings
    let highlightContext = 'interview with company about needs and opportunities';
    try {
      const settings = await prisma.appSettings.findFirst();
      if (settings?.highlightContext) {
        highlightContext = settings.highlightContext;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Continue with default context
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
            content: `You are an AI assistant that extracts key highlights from meeting transcripts. Given the context "${highlightContext}", identify and extract the most important highlights from the meeting transcript.

Focus on:
1. Key insights and revelations
2. Important commitments or agreements
3. Significant problems or challenges mentioned
4. Notable opportunities identified
5. Critical decisions or turning points
6. Memorable quotes or statements
7. Important data points or metrics mentioned

Respond with raw JSON only in this exact format:
{
  "highlights": [
    {
      "category": "insight|commitment|problem|opportunity|decision|quote|data",
      "content": "The actual highlight content",
      "importance": "high|medium|low"
    }
  ]
}

Extract 3-8 highlights maximum, prioritizing the most important ones. Do not include code blocks, markdown, or any other formatting.`
          },
          {
            role: 'user',
            content: `Context: ${highlightContext}

Please extract key highlights from this meeting transcript:

${transcript}`
          }
        ],
        stream: true,
        max_tokens: 1500,
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
                    
                    // Format the highlights for display
                    const highlights = finalResult.highlights || [];
                    const formattedHighlights = highlights
                      .sort((a: any, b: any) => {
                        const importanceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                        return (importanceOrder[b.importance as string] || 0) - (importanceOrder[a.importance as string] || 0);
                      })
                      .map((highlight: any, index: number) => {
                        const emoji: Record<string, string> = {
                          insight: '💡',
                          commitment: '🤝',
                          problem: '⚠️',
                          opportunity: '🚀',
                          decision: '⚡',
                          quote: '💬',
                          data: '📊'
                        };
                        return `${index + 1}. ${emoji[highlight.category as string] || '•'} ${highlight.content}`;
                      })
                      .join('\n\n');

                    const finalHighlights = `KEY HIGHLIGHTS:

${formattedHighlights || 'No significant highlights identified.'}

---
Context: ${highlightContext}`;

                    // Save highlights to database
                    if (meetingId) {
                      await prisma.meeting.update({
                        where: { id: meetingId },
                        data: { 
                          highlights: finalHighlights,
                          status: 'COMPLETED'
                        },
                      });
                    }

                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: finalHighlights
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
                    message: 'Extracting highlights'
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
    console.error('Error generating highlights:', error);
    return NextResponse.json(
      { error: 'Failed to generate highlights' },
      { status: 500 }
    );
  }
}
