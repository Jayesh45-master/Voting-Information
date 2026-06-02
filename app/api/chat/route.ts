import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { 
  AssistantFAQ, 
  GlossaryTerm, 
  StateElection, 
  ElectionResult, 
  TimelineEvent, 
  VotingStep 
} from '@/lib/models';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid or malformed JSON body' }, { status: 400 });
    }

    const { message, language } = body;
    
    if (!message || !language) {
      return NextResponse.json({ error: 'Message and language are required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    // --- HYBRID RETRIEVAL FROM MONGO DB ---
    await dbConnect();
    
    const lowerMessage = message.toLowerCase().trim();
    // Remove basic punctuation for cleaner token comparison
    const cleanMessage = lowerMessage.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    const words = cleanMessage.split(/\s+/).filter((w: string) => w.length > 2);

    // 1. Match Glossary Terms
    const glossaryTerms = await GlossaryTerm.find({});
    const matchedGlossary = glossaryTerms.filter((g: any) => {
      const termLower = g.term.toLowerCase();
      const termHiLower = g.termHi.toLowerCase();
      return cleanMessage.includes(termLower) || 
             cleanMessage.includes(termHiLower) ||
             words.some((w: string) => termLower.includes(w) || termHiLower.includes(w));
    });

    // 2. Match FAQs
    const faqs = await AssistantFAQ.find({});
    const matchedFaqs = faqs.map((faq: any) => {
      let score = 0;
      const keywords = language === 'hi' ? faq.keywordsHi : faq.keywords;
      const question = language === 'hi' ? faq.questionHi : faq.question;
      
      if (keywords) {
        for (const kw of keywords) {
          if (cleanMessage.includes(kw.toLowerCase())) {
            score += 3;
          }
        }
      }
      if (cleanMessage.includes(question.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ""))) {
        score += 5;
      }
      for (const word of words) {
        if (question.toLowerCase().includes(word)) {
          score += 1;
        }
      }
      return { faq, score };
    }).filter((f: any) => f.score > 0).sort((a: any, b: any) => b.score - a.score);

    // 3. Match States & Results
    const stateElections = await StateElection.find({});
    const results = await ElectionResult.find({});
    const matchedStates = stateElections.filter((se: any) => {
      const stateLower = se.stateName.toLowerCase();
      const stateHiLower = se.stateNameHi.toLowerCase();
      return cleanMessage.includes(stateLower) || cleanMessage.includes(stateHiLower);
    });

    // 4. Check query categories
    const isTimelineRelated = words.some((w: string) => ['deadline', 'timeline', 'date', 'when', 'calendar', 'schedule', 'समय', 'सीमा', 'तारीख', 'तिथि', 'शेड्यूल'].includes(w)) || 
                              cleanMessage.includes('election day') || 
                              cleanMessage.includes('चुनाव का दिन');
    const isStepsRelated = words.some((w: string) => ['step', 'how to', 'guide', 'process', 'conduct', 'rule', 'mcc', 'guideline', 'चरण', 'कैसे', 'प्रक्रिया', 'नियम'].includes(w)) ||
                           cleanMessage.includes('how to vote') ||
                           cleanMessage.includes('वोट कैसे');
    const isQuizRelated = words.some((w: string) => ['quiz', 'test', 'question', 'certificate', 'earn', 'score', 'क्विज', 'परीक्षा', 'प्रमाण'].includes(w));

    // --- ASSEMBLE CONTEXT FOR GEMINI ---
    let databaseContext = "";
    if (matchedGlossary.length > 0) {
      databaseContext += "\nRELEVANT GLOSSARY TERMS (Use these to explain electoral terminology):\n" + 
        matchedGlossary.map((g: any) => `- Term: ${g.term} (${g.termHi})\n  Definition: ${g.definition}\n  Definition (Hindi): ${g.definitionHi}`).join('\n');
    }
    if (matchedFaqs.length > 0) {
      databaseContext += "\nRELEVANT PORTAL FAQS:\n" + 
        matchedFaqs.slice(0, 3).map((f: any) => `- Q: ${f.faq.question} (${f.faq.questionHi})\n  A: ${f.faq.answer}\n  A (Hindi): ${f.faq.answerHi}`).join('\n');
    }
    if (matchedStates.length > 0) {
      databaseContext += "\nRELEVANT STATE ELECTION DATA:\n" + matchedStates.map((se: any) => {
        const stateResults = results.filter((r: any) => r.stateName === se.stateName);
        const resultsStr = stateResults.length > 0 
          ? stateResults.map((r: any) => `  * Party: ${r.partyName} (${r.partyNameHi}) | Seats Won: ${r.seatsWon} | Vote Share: ${r.voteShare}`).join('\n')
          : "  * No results recorded yet.";
        return `- State: ${se.stateName} (${se.stateNameHi})\n  Year: ${se.year}\n  Status: ${se.status}\n  Total Seats: ${se.totalSeats}\n  Phases: ${se.phases}\n  Schedule: ${se.dateRange} (${se.dateRangeHi})\n  Results:\n${resultsStr}`;
      }).join('\n');
    }
    if (isTimelineRelated) {
      const timeline = await TimelineEvent.find({});
      databaseContext += "\nPORTAL TIMELINE/DEADLINES:\n" + timeline.map((t: any) => `- Title: ${t.title} (${t.titleHi})\n  Date: ${t.date.toDateString()}\n  Description: ${t.description}\n  Description (Hindi): ${t.descriptionHi}`).join('\n');
    }
    if (isStepsRelated) {
      const steps = await VotingStep.find({});
      databaseContext += "\nVOTING STEPS & PORTAL GUIDELINES:\n" + steps.map((s: any) => `- Step ${s.stepNumber}: ${s.title} (${s.titleHi})\n  Description: ${s.description}\n  Description (Hindi): ${s.descriptionHi}`).join('\n');
    }

    if (geminiKey) {
      // System instructions for Gemini
      const systemInstruction = `You are the Official Election Assistant, a friendly, knowledgeable, and extremely precise assistant for the Indian Voter Information Portal.
Your job is to answer the user's questions about elections in India, voting eligibility, rules, and process.
Keep your answers helpful, concise, and structured.

CRITICAL FORMATTING INSTRUCTIONS:
- Do NOT use any asterisks or stars (like '*' or '**') in your responses. Avoid raw markdown bold markers. Use standard capitalization or spacing for emphasis.
- If you explain anything step-by-step or list multiple items, you MUST format them as a numbered list starting with "1. ", "2. ", "3. " instead of bullet points, stars, or hyphens.

Language instructions:
- Respond in English if the user asks in English or has language 'en'.
- Respond in Hindi (हिन्दी) if the user asks in Hindi or has language 'hi'.

PORTAL DATA CONTEXT (Use this to answer questions about specific states):
1. West Bengal Assembly Election 2026 (Completed):
   - Winner: BJP with 208 seats.
   - Runner-up: All India Trinamool Congress (AITC) with 80 seats.
   - Chief Minister: Suvendu Adhikari.
2. Uttar Pradesh Assembly Election 2027 (Upcoming):
   - Expected: Feb-March 2027.
   - Total Seats: 403.
   - Polling demo is available on the site.
3. Tamil Nadu Election 2026 (Completed):
   - Winner: DMK + Alliance with 159 seats.
4. Kerala Election 2026 (Completed):
   - Winner: Left Democratic Front (LDF) with 99 seats.
5. Assam Election 2026 (Completed):
   - Winner: NDA (BJP + Alliance) with 75 seats.
6. Other Upcoming Elections 2027: Punjab (117 seats), Goa (40 seats), Uttarakhand (70 seats), Manipur (60 seats), Gujarat (182 seats), Himachal Pradesh (68 seats).

CRITICAL DYNAMIC CONTEXT RETRIEVED FROM DATABASE (Prioritize this information to answer user's query):
${databaseContext}

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

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

      try {
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
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
              }
            ],
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.2,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Programmatic cleaning of any remaining raw asterisks/stars
          reply = reply.replace(/\*/g, '');
          
          if (reply.trim()) {
            return NextResponse.json({ reply }, { status: 200 });
          }
        } else {
          const errorData = await response.text();
          console.error('Gemini API returned error, falling back to local search. Details:', errorData);
        }
      } catch (geminiError) {
        console.error('Gemini API request failed, falling back to local search. Details:', geminiError);
      }
    }

    // --- HYBRID LOCAL FALLBACK ---
    let reply = "";
    
    if (language === 'hi') {
      if (matchedGlossary.length > 0) {
        reply = `यहाँ ${matchedGlossary[0].termHi} की परिभाषा दी गई है:\n\n${matchedGlossary[0].definitionHi}\n\nआप [मतदाता शब्दावली (Electoral Glossary)](tab:awareness) में अधिक शब्दावली देख सकते हैं।`;
      } else if (matchedFaqs.length > 0) {
        reply = matchedFaqs[0].faq.answerHi.replace(/\*/g, '');
      } else if (matchedStates.length > 0) {
        const se = matchedStates[0];
        reply = `${se.stateNameHi} विधानसभा चुनाव (${se.year}):\n`;
        reply += `1. स्थिति: ${se.status === 'Completed' ? 'पूर्ण' : 'आगामी'}\n`;
        reply += `2. कुल सीटें: ${se.totalSeats}\n`;
        reply += `3. चरण: ${se.phases}\n`;
        reply += `4. समय सीमा/तारीख: ${se.dateRangeHi}\n`;
        
        const stateResults = results.filter((r: any) => r.stateName === se.stateName);
        if (stateResults.length > 0) {
          reply += `\nचुनाव परिणाम:\n`;
          stateResults.forEach((r: any, idx: number) => {
            reply += `${idx + 1}. ${r.partyNameHi}: ${r.seatsWon} सीटें (वोट शेयर: ${r.voteShare})\n`;
          });
        }
        reply += `\nअधिक विवरण के लिए, [राज्य विधानसभा चुनाव](tab:states) टैब देखें।`;
      } else if (isTimelineRelated) {
        const timeline = await TimelineEvent.find({});
        reply = `यहाँ आगामी चुनाव की समय सीमा (Timeline) दी गई है:\n\n`;
        timeline.forEach((t: any, idx: number) => {
          reply += `${idx + 1}. ${t.titleHi}: ${new Date(t.date).toLocaleDateString('hi-IN')} - ${t.descriptionHi}\n`;
        });
        reply += `\nआप इन विवरणों को [महत्वपूर्ण समय सीमा](tab:overview) में देख सकते हैं।`;
      } else if (isStepsRelated) {
        const steps = await VotingStep.find({});
        reply = `मतदान करने के लिए आवश्यक चरण (Voting Steps) और दिशानिर्देश:\n\n`;
        steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber).forEach((s: any) => {
          reply += `${s.stepNumber}. ${s.titleHi}: ${s.descriptionHi}\n`;
        });
        reply += `\nअधिक जानकारी के लिए [मतदान दिशानिर्देश](/how-to-vote) देखें।`;
      } else if (isQuizRelated) {
        reply = `आप चुनाव और मतदान के बारे में अपने ज्ञान का परीक्षण कर सकते हैं और एक प्रमाण पत्र प्राप्त कर सकते हैं!\n\nकृपया [मतदाता क्विज और प्रमाण पत्र](tab:awareness) टैब पर जाएं।`;
      } else {
        reply = `नमस्ते! मैं आपका मतदाता सहायक हूँ। मैं मतदान प्रक्रिया, पंजीकरण, राज्यों के चुनाव और पोर्टल के विभिन्न फीचर्स के बारे में आपके प्रश्नों का उत्तर दे सकता हूँ।
        
यहाँ कुछ चीजें हैं जो आप कर सकते हैं:
1. राज्य चुनाव परिणाम और आगामी विवरण: [राज्य विधानसभा चुनाव](tab:states) पर जाएं।
2. मॉक पोलिंग का प्रयास करें (उत्तर प्रदेश विधानसभा चुनाव सिम्युलेटर): [लाइव काउंटिंग सिम्युलेटर](tab:live) पर जाएं।
3. क्विज खेलें और सर्टिफिकेट पाएं: [मतदाता क्विज और प्रमाण पत्र](tab:awareness) देखें।
4. शब्दावली (जैसे EVM, VVPAT, MCC): [मतदाता शब्दावली](tab:awareness) देखें।
5. मतदान करने की गाइड: [मतदान दिशानिर्देश](/how-to-vote) पढ़ें।
6. अंतिम तिथियां: [महत्वपूर्ण समय सीमा](tab:overview) पर जाएं।
7. आधिकारिक पंजीकरण: [चुनाव आयोग पोर्टल (ECI)](https://voters.eci.gov.in) पर जाएं।

कृपया अपना प्रश्न पूछें, मैं उत्तर देने के लिए तैयार हूँ!`;
      }
    } else {
      // English fallback
      if (matchedGlossary.length > 0) {
        reply = `Here is the definition for ${matchedGlossary[0].term}:\n\n${matchedGlossary[0].definition}\n\nYou can explore more terms in the [Electoral Glossary](tab:awareness).`;
      } else if (matchedFaqs.length > 0) {
        reply = matchedFaqs[0].faq.answer.replace(/\*/g, '');
      } else if (matchedStates.length > 0) {
        const se = matchedStates[0];
        reply = `${se.stateName} Assembly Election (${se.year}):\n`;
        reply += `1. Status: ${se.status}\n`;
        reply += `2. Total Seats: ${se.totalSeats}\n`;
        reply += `3. Phases: ${se.phases}\n`;
        reply += `4. Schedule: ${se.dateRange}\n`;
        
        const stateResults = results.filter((r: any) => r.stateName === se.stateName);
        if (stateResults.length > 0) {
          reply += `\nElection Results:\n`;
          stateResults.forEach((r: any, idx: number) => {
            reply += `${idx + 1}. ${r.partyName}: ${r.seatsWon} seats (Vote share: ${r.voteShare})\n`;
          });
        }
        reply += `\nFor more details, check out the [State Assembly Elections](tab:states) tab.`;
      } else if (isTimelineRelated) {
        const timeline = await TimelineEvent.find({});
        reply = `Here is the election timeline and key dates:\n\n`;
        timeline.forEach((t: any, idx: number) => {
          reply += `${idx + 1}. ${t.title}: ${new Date(t.date).toDateString()} - ${t.description}\n`;
        });
        reply += `\nCheck [Important Deadlines](tab:overview) for details.`;
      } else if (isStepsRelated) {
        const steps = await VotingStep.find({});
        reply = `Here are the steps to cast your vote:\n\n`;
        steps.sort((a: any, b: any) => a.stepNumber - b.stepNumber).forEach((s: any) => {
          reply += `${s.stepNumber}. ${s.title}: ${s.description}\n`;
        });
        reply += `\nRead the full [How to Vote Guide](/how-to-vote) for details.`;
      } else if (isQuizRelated) {
        reply = `You can test your voter awareness and earn a certificate! Go to [Voter Quiz & Certificate](tab:awareness) to start.`;
      } else {
        reply = `Hello! I am your Election Assistant. I can help answer your questions about voting, registrations, elections, and the portal.
        
Here are some helpful links to guide you:
1. Check Schedules and Results: Visit [State Assembly Elections](tab:states).
2. Try Mock Voting: Go to the [Live Counting Simulator](tab:live).
3. Play the Quiz & get a Certificate: Check out [Voter Quiz & Certificate](tab:awareness).
4. Glossary of Terms (EVM, VVPAT, MCC): Look at [Electoral Glossary](tab:awareness).
5. Step-by-Step Voting Guide: Read the [How to Vote Guide](/how-to-vote).
6. Check Deadlines: Look at [Important Deadlines](tab:overview).
7. Register to Vote: Visit the [Official ECI Portal](https://voters.eci.gov.in).

Please ask any specific question and I'll do my best to answer!`;
      }
    }

    return NextResponse.json({ reply }, { status: 200 });

  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
