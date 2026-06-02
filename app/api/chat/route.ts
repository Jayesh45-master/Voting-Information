import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AssistantFAQ } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { message, language } = await request.json();
    
    if (!message || !language) {
      return NextResponse.json({ error: 'Message and language are required' }, { status: 400 });
    }

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
