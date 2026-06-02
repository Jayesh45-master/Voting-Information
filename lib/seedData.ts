import { TimelineEvent, VotingStep, AssistantFAQ, NewsArticle, StateElection, ElectionResult, GlossaryTerm, QuizQuestion } from './models';
import dbConnect from './mongodb';

const timelineData = [
  {
    title: 'Voter Registration Deadline',
    titleHi: 'मतदाता पंजीकरण की समय सीमा',
    date: new Date('2026-10-05T00:00:00Z'),
    description: 'Last day to register to vote for the upcoming general election.',
    descriptionHi: 'आगामी आम चुनाव के लिए मतदान हेतु पंजीकरण करने का अंतिम दिन।',
    isImportant: true,
  },
  {
    title: 'Early Voting Begins',
    titleHi: 'प्रारंभिक मतदान शुरू',
    date: new Date('2026-10-20T00:00:00Z'),
    description: 'Polling places open for early in-person voting.',
    descriptionHi: 'प्रारंभिक व्यक्तिगत मतदान के लिए मतदान केंद्र खुलेंगे।',
    isImportant: false,
  },
  {
    title: 'Election Day',
    titleHi: 'चुनाव का दिन',
    date: new Date('2026-11-03T00:00:00Z'),
    description: 'General Election Day. Polls are open from 7 AM to 8 PM.',
    descriptionHi: 'आम चुनाव का दिन। मतदान सुबह 7 बजे से रात 8 बजे तक खुले रहेंगे।',
    isImportant: true,
  },
];

const stepsData = [
  {
    stepNumber: 1,
    title: 'Check Eligibility',
    titleHi: 'पात्रता जांचें',
    description: 'Ensure you meet the age and citizenship requirements to vote in your jurisdiction.',
    descriptionHi: 'सुनिश्चित करें कि आप अपने अधिकार क्षेत्र में मतदान करने के लिए आयु और नागरिकता आवश्यकताओं को पूरा करते हैं।',
    icon: 'user-check',
    isGuideline: false,
  },
  {
    stepNumber: 2,
    title: 'Register to Vote',
    titleHi: 'मतदान के लिए पंजीकरण करें',
    description: 'Submit your registration application online, by mail, or in person before the deadline.',
    descriptionHi: 'समय सीमा से पहले अपना पंजीकरण आवेदन ऑनलाइन, डाक द्वारा या व्यक्तिगत रूप से जमा करें।',
    icon: 'edit',
    isGuideline: false,
  },
  {
    stepNumber: 3,
    title: 'Find Your Polling Place',
    titleHi: 'अपना मतदान केंद्र खोजें',
    description: 'Locate your designated polling station or request a mail-in ballot if preferred.',
    descriptionHi: 'अपने निर्धारित मतदान केंद्र का पता लगाएं या यदि चाहें तो मेल-इन मतपत्र का अनुरोध करें।',
    icon: 'map-pin',
    isGuideline: false,
  },
  {
    stepNumber: 4,
    title: 'Cast Your Ballot',
    titleHi: 'अपना वोट डालें',
    description: 'Bring required identification and vote on Election Day or during the early voting period.',
    descriptionHi: 'आवश्यक पहचान पत्र लाएं और चुनाव के दिन या प्रारंभिक मतदान अवधि के दौरान मतदान करें।',
    icon: 'inbox',
    isGuideline: false,
  },
  {
    stepNumber: 5,
    title: 'General Guidelines: Code of Conduct',
    titleHi: 'सामान्य दिशानिर्देश: आचार संहिता',
    description: 'Follow the polling station rules, avoid carrying campaign materials, and respect the privacy of other voters.',
    descriptionHi: 'मतदान केंद्र के नियमों का पालन करें, चुनाव प्रचार सामग्री ले जाने से बचें और अन्य मतदाताओं की गोपनीयता का सम्मान करें।',
    icon: 'user-check',
    isGuideline: true,
  }
];

const faqData = [
  {
    question: 'How do I register to vote?',
    questionHi: 'मैं मतदान के लिए पंजीकरण कैसे करूं?',
    answer: 'You can register online through the official portal, by mailing a voter registration form, or in person at designated government offices.',
    answerHi: 'आप आधिकारिक पोर्टल के माध्यम से ऑनलाइन, मतदाता पंजीकरण फॉर्म डाक से भेजकर, या निर्दिष्ट सरकारी कार्यालयों में व्यक्तिगत रूप से पंजीकरण कर सकते हैं।',
    keywords: ['register', 'how to register', 'sign up', 'voter registration'],
    keywordsHi: ['पंजीकरण', 'कैसे करें', 'मतदाता'],
  },
  {
    question: 'When is Election Day?',
    questionHi: 'चुनाव का दिन कब है?',
    answer: 'The next General Election is scheduled for November 3, 2026. Polls will be open from 7:00 AM to 8:00 PM.',
    answerHi: 'अगला आम चुनाव 3 नवंबर, 2026 को निर्धारित है। मतदान सुबह 7:00 बजे से रात 8:00 बजे तक खुले रहेंगे।',
    keywords: ['election day', 'when is the election', 'date', 'time'],
    keywordsHi: ['चुनाव', 'दिन', 'तारीख', 'समय', 'कब'],
  },
  {
    question: 'What do I need to bring to the polling place?',
    questionHi: 'मुझे मतदान केंद्र पर क्या लाना होगा?',
    answer: 'Please bring a valid photo ID (such as a driver\'s license or passport) and your voter registration card if you have one.',
    answerHi: 'कृपया एक वैध फोटो पहचान पत्र (जैसे ड्राइविंग लाइसेंस या पासपोर्ट) और यदि आपके पास मतदाता पंजीकरण कार्ड है तो उसे लाएं।',
    keywords: ['bring', 'id', 'identification', 'need', 'polling place'],
    keywordsHi: ['लाना', 'पहचान', 'आईडी', 'मतदान केंद्र'],
  },
  {
    question: 'Can I vote by mail?',
    questionHi: 'क्या मैं डाक द्वारा मतदान कर सकता हूँ?',
    answer: 'Yes, mail-in voting is available. You must request a mail-in ballot by the specified deadline prior to Election Day.',
    answerHi: 'हां, मेल-इन मतदान उपलब्ध है। आपको चुनाव के दिन से पहले निर्दिष्ट समय सीमा तक मेल-इन मतपत्र का अनुरोध करना होगा।',
    keywords: ['mail', 'absentee', 'vote by mail', 'post'],
    keywordsHi: ['डाक', 'मेल', 'मतदान'],
  },
  // --- STATE SPECIFIC FAQs ---
  {
    question: 'When are the elections in Maharashtra?',
    questionHi: 'महाराष्ट्र में चुनाव कब हैं?',
    answer: 'The Maharashtra Legislative Assembly elections are scheduled for late 2024. Please check the official State Election Commission website for exact dates.',
    answerHi: 'महाराष्ट्र विधानसभा चुनाव 2024 के अंत में होने वाले हैं। कृपया सटीक तारीखों के लिए आधिकारिक राज्य चुनाव आयोग की वेबसाइट देखें।',
    keywords: ['maharashtra', 'mumbai', 'pune', 'nagpur'],
    keywordsHi: ['महाराष्ट्र', 'मुंबई', 'पुणे', 'नागपुर'],
  },
  {
    question: 'When are the elections in Haryana?',
    questionHi: 'हरियाणा में चुनाव कब हैं?',
    answer: 'The Haryana Legislative Assembly elections are scheduled for late 2024. The exact polling dates will be announced by the Election Commission soon.',
    answerHi: 'हरियाणा विधानसभा चुनाव 2024 के अंत में होने वाले हैं। मतदान की सटीक तारीखों की घोषणा जल्द ही चुनाव आयोग द्वारा की जाएगी।',
    keywords: ['haryana', 'gurugram', 'chandigarh'],
    keywordsHi: ['हरियाणा', 'गुरुग्राम', 'चंडीगढ़'],
  },
  {
    question: 'When are the elections in Delhi?',
    questionHi: 'दिल्ली में चुनाव कब हैं?',
    answer: 'The Delhi Legislative Assembly elections are expected to be held in early 2025. Stay tuned to the official portal for the notification.',
    answerHi: 'दिल्ली विधानसभा चुनाव 2025 की शुरुआत में होने की उम्मीद है। अधिसूचना के लिए आधिकारिक पोर्टल पर बने रहें।',
    keywords: ['delhi', 'new delhi', 'ncr'],
    keywordsHi: ['दिल्ली', 'नई दिल्ली', 'एनसीआर'],
  },
  {
    question: 'Which states are having elections this year?',
    questionHi: 'इस वर्ष किन राज्यों में चुनाव हो रहे हैं?',
    answer: 'Major upcoming state elections include Maharashtra and Haryana in late 2024, followed by Delhi and Bihar in 2025.',
    answerHi: 'आगामी प्रमुख राज्य चुनावों में 2024 के अंत में महाराष्ट्र और हरियाणा शामिल हैं, इसके बाद 2025 में दिल्ली और बिहार में चुनाव होंगे।',
    keywords: ['states', 'which state', 'all states', 'year'],
    keywordsHi: ['राज्यों', 'कौन से राज्य', 'सभी राज्य', 'वर्ष'],
  }
];

const newsData = [
  {
    headline: 'Record Turnout Expected for Upcoming Elections',
    headlineHi: 'आगामी चुनावों के लिए रिकॉर्ड मतदान की उम्मीद',
    source: 'Election Commission Daily',
    date: new Date('2026-04-15T00:00:00Z'),
    link: '#'
  },
  {
    headline: 'New Accessible Voting Machines Deployed Nationwide',
    headlineHi: 'देश भर में नई सुलभ वोटिंग मशीनें तैनात',
    source: 'National News Wire',
    date: new Date('2026-04-20T00:00:00Z'),
    link: '#'
  },
  {
    headline: 'Deadline for Voter Registration Extended in 5 States',
    headlineHi: '5 राज्यों में मतदाता पंजीकरण की समय सीमा बढ़ाई गई',
    source: 'Government Press',
    date: new Date('2026-04-25T00:00:00Z'),
    link: '#'
  }
];

const stateElectionsData = [
  {
    stateName: 'West Bengal',
    stateNameHi: 'पश्चिम बंगाल',
    year: 2026,
    dateRange: 'April-May 2026',
    dateRangeHi: 'अप्रैल-मई 2026',
    totalSeats: 294,
    status: 'Completed',
    phases: 8,
    infoUrl: 'https://results.eci.gov.in',
  },
  {
    stateName: 'Tamil Nadu',
    stateNameHi: 'तमिलनाडु',
    year: 2026,
    dateRange: 'April 2026',
    dateRangeHi: 'अप्रैल 2026',
    totalSeats: 234,
    status: 'Completed',
    phases: 1,
    infoUrl: 'https://results.eci.gov.in',
  },
  {
    stateName: 'Kerala',
    stateNameHi: 'केरल',
    year: 2026,
    dateRange: 'April 2026',
    dateRangeHi: 'अप्रैल 2026',
    totalSeats: 140,
    status: 'Completed',
    phases: 1,
    infoUrl: 'https://results.eci.gov.in',
  },
  {
    stateName: 'Assam',
    stateNameHi: 'असम',
    year: 2026,
    dateRange: 'April 2026',
    dateRangeHi: 'अप्रैल 2026',
    totalSeats: 126,
    status: 'Completed',
    phases: 3,
    infoUrl: 'https://results.eci.gov.in',
  },
  {
    stateName: 'Puducherry',
    stateNameHi: 'पुदुचेरी',
    year: 2026,
    dateRange: 'April 2026',
    dateRangeHi: 'अप्रैल 2026',
    totalSeats: 30,
    status: 'Completed',
    phases: 1,
    infoUrl: 'https://results.eci.gov.in',
  },
  {
    stateName: 'Uttar Pradesh',
    stateNameHi: 'उत्तर प्रदेश',
    year: 2027,
    dateRange: 'Expected Feb-March 2027',
    dateRangeHi: 'संभावित फरवरी-मार्च 2027',
    totalSeats: 403,
    status: 'Upcoming',
    phases: 7,
    infoUrl: 'https://voters.eci.gov.in',
  },
  {
    stateName: 'Punjab',
    stateNameHi: 'पंजाब',
    year: 2027,
    dateRange: 'Expected Feb-March 2027',
    dateRangeHi: 'संभावित फरवरी-मार्च 2027',
    totalSeats: 117,
    status: 'Upcoming',
    phases: 1,
    infoUrl: 'https://voters.eci.gov.in',
  },
  {
    stateName: 'Goa',
    stateNameHi: 'गोवा',
    year: 2027,
    dateRange: 'Expected Feb-March 2027',
    dateRangeHi: 'संभावित फरवरी-मार्च 2027',
    totalSeats: 40,
    status: 'Upcoming',
    phases: 1,
    infoUrl: 'https://voters.eci.gov.in',
  },
  {
    stateName: 'Uttarakhand',
    stateNameHi: 'उत्तराखंड',
    year: 2027,
    dateRange: 'Expected Feb-March 2027',
    dateRangeHi: 'संभावित फरवरी-मार्च 2027',
    totalSeats: 70,
    status: 'Upcoming',
    phases: 1,
    infoUrl: 'https://voters.eci.gov.in',
  },
  {
    stateName: 'Manipur',
    stateNameHi: 'मणिपुर',
    year: 2027,
    dateRange: 'Expected Feb-March 2027',
    dateRangeHi: 'संभावित फरवरी-मार्च 2027',
    totalSeats: 60,
    status: 'Upcoming',
    phases: 2,
    infoUrl: 'https://voters.eci.gov.in',
  },
  {
    stateName: 'Gujarat',
    stateNameHi: 'गुजरात',
    year: 2027,
    dateRange: 'Expected December 2027',
    dateRangeHi: 'संभावित दिसंबर 2027',
    totalSeats: 182,
    status: 'Upcoming',
    phases: 2,
    infoUrl: 'https://voters.eci.gov.in',
  },
  {
    stateName: 'Himachal Pradesh',
    stateNameHi: 'हिमाचल प्रदेश',
    year: 2027,
    dateRange: 'Expected November 2027',
    dateRangeHi: 'संभावित नवंबर 2027',
    totalSeats: 68,
    status: 'Upcoming',
    phases: 1,
    infoUrl: 'https://voters.eci.gov.in',
  }
];

const electionResultsData = [
  // West Bengal
  { stateName: 'West Bengal', partyName: 'Bharatiya Janata Party (BJP)', partyNameHi: 'भारतीय जनता पार्टी', seatsWon: 208, voteShare: '48.2%', color: '#EF6C00' },
  { stateName: 'West Bengal', partyName: 'All India Trinamool Congress (AITC)', partyNameHi: 'सर्वभारतीय तृणमूल कांग्रेस', seatsWon: 80, voteShare: '38.5%', color: '#2E7D32' },
  { stateName: 'West Bengal', partyName: 'Left Front & Congress Alliance', partyNameHi: 'वाम मोर्चा और कांग्रेस गठबंधन', seatsWon: 3, voteShare: '9.8%', color: '#C62828' },
  { stateName: 'West Bengal', partyName: 'Others', partyNameHi: 'अन्य', seatsWon: 3, voteShare: '3.5%', color: '#78909C' },
  
  // Tamil Nadu
  { stateName: 'Tamil Nadu', partyName: 'Dravida Munnetra Kazhagam (DMK) + Alliance', partyNameHi: 'द्रविड़ मुनेत्र कड़गम + गठबंधन', seatsWon: 159, voteShare: '45.6%', color: '#C62828' },
  { stateName: 'Tamil Nadu', partyName: 'All India Anna Dravida Munnetra Kazhagam (AIADMK) + Alliance', partyNameHi: 'अखिल भारतीय अन्ना द्रविड़ मुनेत्र कड़गम + गठबंधन', seatsWon: 75, voteShare: '39.7%', color: '#2E7D32' },
  { stateName: 'Tamil Nadu', partyName: 'Others', partyNameHi: 'अन्य', seatsWon: 0, voteShare: '14.7%', color: '#78909C' },

  // Kerala
  { stateName: 'Kerala', partyName: 'Left Democratic Front (LDF)', partyNameHi: 'एलडीएफ (वाम मोर्चा)', seatsWon: 99, voteShare: '45.4%', color: '#C62828' },
  { stateName: 'Kerala', partyName: 'United Democratic Front (UDF)', partyNameHi: 'यूडीएफ (कांग्रेस गठबंधन)', seatsWon: 41, voteShare: '39.4%', color: '#1565C0' },
  { stateName: 'Kerala', partyName: 'NDA', partyNameHi: 'राजग', seatsWon: 0, voteShare: '12.2%', color: '#EF6C00' },
  { stateName: 'Kerala', partyName: 'Others', partyNameHi: 'अन्य', seatsWon: 0, voteShare: '3.0%', color: '#78909C' },

  // Assam
  { stateName: 'Assam', partyName: 'NDA (BJP + Alliance)', partyNameHi: 'राजग (भाजपा + गठबंधन)', seatsWon: 75, voteShare: '44.8%', color: '#EF6C00' },
  { stateName: 'Assam', partyName: 'Mahajot (Congress + Alliance)', partyNameHi: 'महाजोत (कांग्रेस + गठबंधन)', seatsWon: 50, voteShare: '40.6%', color: '#1565C0' },
  { stateName: 'Assam', partyName: 'Others', partyNameHi: 'अन्य', seatsWon: 1, voteShare: '14.6%', color: '#78909C' },

  // Puducherry
  { stateName: 'Puducherry', partyName: 'AINRC + BJP Alliance', partyNameHi: 'एआईएनआरसी + भाजपा गठबंधन', seatsWon: 16, voteShare: '42.5%', color: '#EF6C00' },
  { stateName: 'Puducherry', partyName: 'Congress + DMK Alliance', partyNameHi: 'कांग्रेस + द्रमुक गठबंधन', seatsWon: 8, voteShare: '38.0%', color: '#1565C0' },
  { stateName: 'Puducherry', partyName: 'Others & Independents', partyNameHi: 'अन्य और निर्दलीय', seatsWon: 6, voteShare: '19.5%', color: '#78909C' },
];

const glossaryData = [
  {
    term: "EVM (Electronic Voting Machine)",
    termHi: "ईवीएम (इलेक्ट्रॉनिक वोटिंग मशीन)",
    definition: "A device used to electronically record and count votes cast in elections.",
    definitionHi: "चुनावों में डाले गए मतों को इलेक्ट्रॉनिक रूप से रिकॉर्ड करने और उनकी गणना करने के लिए उपयोग किया जाने वाला उपकरण।",
    category: "Technology"
  },
  {
    term: "VVPAT (Voter Verifiable Paper Audit Trail)",
    termHi: "वीवीपैट (मतदाता सत्यापन योग्य पेपर ऑडिट ट्रेल)",
    definition: "An independent verification printer system attached to EVMs that allows voters to verify their vote was cast correctly.",
    definitionHi: "ईवीएम से जुड़ा एक स्वतंत्र सत्यापन प्रिंटर सिस्टम जो मतदाताओं को यह सत्यापित करने की अनुमति देता है कि उनका वोट सही तरीके से डाला गया है।",
    category: "Technology"
  },
  {
    term: "Model Code of Conduct (MCC)",
    termHi: "आदर्श आचार संहिता (MCC)",
    definition: "Guidelines issued by the Election Commission of India for conduct of political parties and candidates during elections.",
    definitionHi: "चुनावों के दौरान राजनीतिक दलों और उम्मीदवारों के आचरण के लिए भारत निर्वाचन आयोग द्वारा जारी दिशानिर्देश।",
    category: "Legal"
  },
  {
    term: "NOTA (None of the Above)",
    termHi: "नोटा (इनमें से कोई नहीं)",
    definition: "A ballot option allowing voters to officially register a vote of rejection for all contesting candidates.",
    definitionHi: "एक मतपत्र विकल्प जो मतदाताओं को आधिकारिक तौर पर सभी चुनाव लड़ने वाले उम्मीदवारों के प्रति अस्वीकृति का वोट दर्ज करने की अनुमति देता है।",
    category: "General"
  },
  {
    term: "Postal Ballot",
    termHi: "डाक मतपत्र",
    definition: "A method of voting where ballot papers are distributed to and returned by post, typically for service voters or election staff.",
    definitionHi: "मतदान की एक विधि जहां मतपत्र डाक द्वारा वितरित और वापस किए जाते हैं, आमतौर पर सेवा मतदाताओं या चुनाव कर्मियों के लिए।",
    category: "General"
  },
  {
    term: "Delimitation",
    termHi: "परिसीमन",
    definition: "The act of redrawing boundaries of assembly or parliamentary constituencies based on recent census data.",
    definitionHi: "हालिया जनगणना के आंकड़ों के आधार पर विधानसभा या संसदीय निर्वाचन क्षेत्रों की सीमाओं को फिर से निर्धारित करने का कार्य।",
    category: "Legal"
  },
  {
    term: "By-Poll",
    termHi: "उपचुनाव",
    definition: "An election held to fill a vacancy caused by the death, resignation, or disqualification of an elected member.",
    definitionHi: "एक निर्वाचित सदस्य की मृत्यु, इस्तीफे, या अयोग्यता के कारण हुई रिक्ति को भरने के लिए आयोजित किया जाने वाला चुनाव।",
    category: "General"
  }
];

const quizData = [
  {
    question: "What is the minimum voting age in India?",
    questionHi: "भारत में मतदान की न्यूनतम आयु क्या है?",
    options: ["16 years", "18 years", "21 years", "25 years"],
    optionsHi: ["16 वर्ष", "18 वर्ष", "21 वर्ष", "25 वर्ष"],
    correctAnswerIndex: 1,
    explanation: "The minimum age to vote in India was lowered from 21 to 18 years by the 61st Constitutional Amendment Act in 1988.",
    explanationHi: "भारत में मतदान की न्यूनतम आयु को 1988 में 61वें संविधान संशोधन अधिनियम द्वारा 21 वर्ष से घटाकर 18 वर्ष कर दिया गया था।"
  },
  {
    question: "Which article of the Indian Constitution details the establishment and powers of the Election Commission of India?",
    questionHi: "भारतीय संविधान का कौन सा अनुच्छेद भारत निर्वाचन आयोग की स्थापना और शक्तियों का विवरण देता है?",
    options: ["Article 324", "Article 356", "Article 370", "Article 110"],
    optionsHi: ["अनुच्छेद 324", "अनुच्छेद 356", "अनुच्छेद 370", "अनुच्छेद 110"],
    correctAnswerIndex: 0,
    explanation: "Article 324 of the Constitution vests the superintendence, direction, and control of elections in the Election Commission.",
    explanationHi: "संविधान का अनुच्छेद 324 चुनावों के अधीक्षण, निर्देशन और नियंत्रण की शक्ति निर्वाचन आयोग को सौंपता है।"
  },
  {
    question: "For how many seconds does the VVPAT paper slip remain visible to the voter after casting a vote?",
    questionHi: "वोट डालने के बाद वीवीपैट (VVPAT) की पेपर पर्ची मतदाता को कितने सेकंड तक दिखाई देती है?",
    options: ["3 seconds", "5 seconds", "7 seconds", "10 seconds"],
    optionsHi: ["3 सेकंड", "5 सेकंड", "7 सेकंड", "10 सेकंड"],
    correctAnswerIndex: 2,
    explanation: "The printed VVPAT paper slip containing the candidate's serial number, name, and symbol is displayed behind a glass window for 7 seconds before falling into the sealed box.",
    explanationHi: "उम्मीदवार की क्रम संख्या, नाम और चुनाव चिह्न वाली मुद्रित वीवीपैट पेपर पर्ची सीलबंद बॉक्स में गिरने से पहले 7 सेकंड के लिए ग्लास विंडो के पीछे प्रदर्शित होती है।"
  },
  {
    question: "Which official mobile app can citizens use to report violations of the Model Code of Conduct directly to the ECI?",
    questionHi: "आदर्श आचार संहिता के उल्लंघन की रिपोर्ट सीधे चुनाव आयोग को करने के लिए नागरिक किस आधिकारिक मोबाइल ऐप का उपयोग कर सकते हैं?",
    options: ["Voter Helpline App", "cVIGIL", "Saksham App", "KYC App"],
    optionsHi: ["वोटर हेल्पलाइन ऐप", "सी-विजिल (cVIGIL)", "सक्षम ऐप", "केवाईसी (KYC) ऐप"],
    correctAnswerIndex: 1,
    explanation: "cVIGIL (Vigilant Citizen) is an ECI app that allows citizens to upload photos or videos of model code violations, which are resolved within a 100-minute timeline.",
    explanationHi: "सी-विजिल (cVIGIL) चुनाव आयोग का एक ऐप है जो नागरिकों को आचार संहिता के उल्लंघन की तस्वीरें या वीडियो अपलोड करने की अनुमति देता है, जिनका निवारण 100 मिनट के भीतर किया जाता है।"
  },
  {
    question: "What does NOTA stand for on the ballot/EVM?",
    questionHi: "मतपत्र/ईवीएम पर नोटा (NOTA) का क्या अर्थ है?",
    options: ["No Options To Approve", "None Of The Above", "National Order for Trustworthy Candidates", "Name of The Alliance"],
    optionsHi: ["नो ऑप्शंस टू अप्रूव", "नन ऑफ द अबव (इनमें से कोई नहीं)", "नेशनल ऑर्डर फॉर ट्रस्टवर्दी कैंडिडेट्स", "नेम ऑफ द अलायंस"],
    correctAnswerIndex: 1,
    explanation: "NOTA stands for 'None of the Above'. It was introduced in India in 2013 following a Supreme Court directive to give voters a right to reject all candidates.",
    explanationHi: "नोटा (NOTA) का मतलब 'नन ऑफ द अबव' है। मतदाताओं को सभी उम्मीदवारों को अस्वीकार करने का अधिकार देने के लिए सर्वोच्च न्यायालय के निर्देश के बाद 2013 में इसे भारत में पेश किया गया था।"
  }
];

export async function seedDatabase() {
  await dbConnect();

  console.log('Clearing existing data...');
  await TimelineEvent.deleteMany({});
  await VotingStep.deleteMany({});
  await AssistantFAQ.deleteMany({});
  await NewsArticle.deleteMany({});
  await StateElection.deleteMany({});
  await ElectionResult.deleteMany({});
  await GlossaryTerm.deleteMany({});
  await QuizQuestion.deleteMany({});

  console.log('Seeding Timeline Events...');
  await TimelineEvent.insertMany(timelineData);

  console.log('Seeding Voting Steps...');
  await VotingStep.insertMany(stepsData);

  console.log('Seeding FAQs...');
  await AssistantFAQ.insertMany(faqData);

  console.log('Seeding News...');
  await NewsArticle.insertMany(newsData);

  console.log('Seeding State Election Metadata...');
  await StateElection.insertMany(stateElectionsData);

  console.log('Seeding Election Results...');
  await ElectionResult.insertMany(electionResultsData);

  console.log('Seeding Glossary Terms...');
  await GlossaryTerm.insertMany(glossaryData);

  console.log('Seeding Quiz Questions...');
  await QuizQuestion.insertMany(quizData);

  console.log('Database seeded successfully!');
}
