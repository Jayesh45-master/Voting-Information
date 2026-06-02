import mongoose from 'mongoose';

// --- Timeline Schema ---
const TimelineEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHi: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  descriptionHi: { type: String, required: true },
  isImportant: { type: Boolean, default: false },
});

export const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', TimelineEventSchema);

// --- Voting Step Schema ---
const VotingStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  titleHi: { type: String, required: true },
  description: { type: String, required: true },
  descriptionHi: { type: String, required: true },
  icon: { type: String }, // optional icon identifier
  isGuideline: { type: Boolean, default: false }, // to differentiate generic guidelines from steps
});

export const VotingStep = mongoose.models.VotingStep || mongoose.model('VotingStep', VotingStepSchema);

// --- Assistant FAQ Schema ---
const AssistantFAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionHi: { type: String, required: true },
  answer: { type: String, required: true },
  answerHi: { type: String, required: true },
  keywords: [{ type: String }], // Array of keywords for simple matching
  keywordsHi: [{ type: String }], // Hindi keywords
});

export const AssistantFAQ = mongoose.models.AssistantFAQ || mongoose.model('AssistantFAQ', AssistantFAQSchema);

// --- News Schema ---
const NewsArticleSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  headlineHi: { type: String, required: true },
  source: { type: String, required: true },
  date: { type: Date, required: true },
  link: { type: String, required: true },
});

export const NewsArticle = mongoose.models.NewsArticle || mongoose.model('NewsArticle', NewsArticleSchema);

// --- State Election Schema ---
const StateElectionSchema = new mongoose.Schema({
  stateName: { type: String, required: true },
  stateNameHi: { type: String, required: true },
  year: { type: Number, required: true },
  dateRange: { type: String, required: true },
  dateRangeHi: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Completed', 'Upcoming'] },
  phases: { type: Number, default: 1 },
  infoUrl: { type: String, default: '#' },
});

export const StateElection = mongoose.models.StateElection || mongoose.model('StateElection', StateElectionSchema);

// --- Election Result Schema ---
const ElectionResultSchema = new mongoose.Schema({
  stateName: { type: String, required: true },
  partyName: { type: String, required: true },
  partyNameHi: { type: String, required: true },
  seatsWon: { type: Number, required: true },
  voteShare: { type: String, required: true },
  color: { type: String, default: '#718096' },
});

export const ElectionResult = mongoose.models.ElectionResult || mongoose.model('ElectionResult', ElectionResultSchema);

// --- Glossary Term Schema ---
const GlossaryTermSchema = new mongoose.Schema({
  term: { type: String, required: true },
  termHi: { type: String, required: true },
  definition: { type: String, required: true },
  definitionHi: { type: String, required: true },
  category: { type: String, required: true },
});

export const GlossaryTerm = mongoose.models.GlossaryTerm || mongoose.model('GlossaryTerm', GlossaryTermSchema);

// --- Quiz Question Schema ---
const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  questionHi: { type: String, required: true },
  options: [{ type: String, required: true }],
  optionsHi: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
  explanationHi: { type: String, required: true },
});

export const QuizQuestion = mongoose.models.QuizQuestion || mongoose.model('QuizQuestion', QuizQuestionSchema);

