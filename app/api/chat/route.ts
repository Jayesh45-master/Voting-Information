import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AssistantFAQ } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { message, language } = await request.json();
    
    if (!message || !language) {
      return NextResponse.json({ error: 'Message and language are required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      // System instructions for Gemini
      const systemInstruction = `You are the Official Election Assistant, a friendly, knowledgeable, and extremely precise assistant for the Indian Voter Information Portal.
Your job is to answer the user's questions about elections in India, voting eligibility, rules, and process.
Keep your answers helpful, concise, and structured. Use bullet points if listing steps.

Language instructions:
- Respond in English if the user asks in English or has language 'en'.
- Respond in Hindi (हिन्दी) if the user asks in Hindi or has language 'hi'.

CRITICAL INSTRUCTIONS ON REDIRECT LINKS:
If you talk about any of the following features/pages in your response, you MUST use the exact markdown link format so the user can be redirected there:
- Check schedules, results, or CM info: [State Assembly Elections](tab:states)
- Play the quiz or get a Certificate: [Voter Quiz & Certificate](tab:awareness)
- Look up terms (MCC, EVM, VVPAT, NOTA): [Electoral Glossary](tab:awareness)
- Read guidelines on how to cast a vote: [How to Vote Guide](/how-to-vote)
- Check deadlines: [Important Deadlines](tab:overview)
- View the Uttar Pradesh live simulation: [Live Counting Simulator](tab:live)
- Register to vote: [Official ECI Portal](https://voters.eci.gov.in)

Example:
- English: "You can test your knowledge by playing the [Voter Quiz & Certificate](tab:awareness)!"
- Hindi: "आप [मतदाता क्विज और प्रमाण पत्र](tab:awareness) खेलकर अपने ज्ञान का परीक्षण कर सकते हैं!"
Always keep the link target lowercase and exactly as specified (e.g. 'tab:states', 'tab:awareness', 'tab:overview', 'tab:live', '/how-to-vote'). Do not invent new tabs.`;

      // Call Gemini API using native fetch
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: systemInstruction
              }
            ]
          },
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.2,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (reply.trim()) {
          return NextResponse.json({ reply }, { status: 200 });
        }
      } else {
        const errorData = await response.text();
        console.error('Gemini API returned error:', errorData);
      }
    }

    // --- FALLBACK TO LOCAL DATABASE FAQ ---
    await dbConnect();
    
    // Simple keyword matching for the assistant
    const faqs = await AssistantFAQ.find({});
    
    const lowerMessage = message.toLowerCase();
    
    let bestMatch = null;
    let maxMatches = 0;

    for (const faq of faqs) {
      let matches = 0;
      
      // Determine which keyword array to use based on selected language
      const keywordsToMatch = language === 'hi' ? faq.keywordsHi : faq.keywords;

      if (keywordsToMatch && keywordsToMatch.length > 0) {
        for (const keyword of keywordsToMatch) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            matches++;
          }
        }
      }
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = faq;
      }
    }

    if (bestMatch) {
      const reply = language === 'hi' ? bestMatch.answerHi : bestMatch.answer;
      return NextResponse.json({ reply }, { status: 200 });
    } else {
      const defaultReply = language === 'hi' 
        ? "मुझे इसके बारे में निश्चित जानकारी नहीं है। क्या आप मतदाता पंजीकरण, चुनाव तिथियों, या मेल-इन मतदान के बारे में पूछने का प्रयास कर सकते हैं?"
        : "I'm not sure about that. Could you try asking about voter registration, election dates, or mail-in voting?";
      return NextResponse.json({ reply: defaultReply }, { status: 200 });
    }

  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
