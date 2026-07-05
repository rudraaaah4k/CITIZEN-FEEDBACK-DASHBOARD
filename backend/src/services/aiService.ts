/**
 * Free AI Analysis Service
 * Uses rule-based NLP with the 'natural' library - no API keys required
 * Provides: Sentiment Analysis, Emotion Detection, Keyword Extraction,
 * Topic Classification, Spam Detection, Urgency Detection, Language Detection
 */

import natural from 'natural';
import { IAIAnalysis } from '../models/Feedback';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const analyzer = new natural.SentimentAnalyzer('English', stemmer, 'afinn');
const TfIdf = natural.TfIdf;

// Keyword dictionaries for various analyses
const URGENT_KEYWORDS = [
  'urgent', 'emergency', 'immediately', 'critical', 'danger', 'dangerous',
  'life', 'death', 'dying', 'fire', 'flood', 'accident', 'injury', 'injured',
  'hospital', 'police', 'ambulance', 'help', 'sos', 'asap', 'now', 'threat',
  'violence', 'attack', 'bleeding', 'unconscious', 'collapsed', 'explosion',
];

const SPAM_KEYWORDS = [
  'buy now', 'click here', 'free money', 'winner', 'lottery', 'prize',
  'claim', 'bitcoin', 'crypto', 'investment', 'profit', 'mlm', 'pyramid',
  'weight loss', 'diet pill', 'make money fast', 'work from home guaranteed',
  'enlargement', 'cheap meds', 'prescription drugs', 'casino', 'gambling',
];

const ANGER_KEYWORDS = [
  'angry', 'furious', 'outraged', 'disgusted', 'unacceptable', 'terrible',
  'horrible', 'worst', 'hate', 'stupid', 'incompetent', 'useless', 'failure',
  'demand', 'lawsuit', 'sue', 'negligent', 'corrupt', 'fraud', 'scam',
];

const JOY_KEYWORDS = [
  'happy', 'excellent', 'great', 'wonderful', 'amazing', 'fantastic',
  'love', 'appreciate', 'grateful', 'thankful', 'pleased', 'satisfied',
  'outstanding', 'impressed', 'perfect', 'brilliant', 'superb', 'awesome',
];

const FEAR_KEYWORDS = [
  'afraid', 'scared', 'frightened', 'terrified', 'worried', 'anxious',
  'panic', 'nervous', 'unsafe', 'insecure', 'threatened', 'risk', 'hazard',
  'dangerous', 'concerned', 'alarming', 'disturbing',
];

const SADNESS_KEYWORDS = [
  'sad', 'depressed', 'disappointed', 'upset', 'unhappy', 'frustrated',
  'suffering', 'pain', 'hurt', 'grief', 'loss', 'unfortunate', 'miserable',
  'hopeless', 'desperate', 'dejected', 'heartbroken',
];

const TOPIC_PATTERNS: Record<string, string[]> = {
  'Road & Infrastructure': ['road', 'pothole', 'pavement', 'bridge', 'traffic', 'street', 'highway', 'construction', 'footpath', 'sidewalk'],
  'Water Supply': ['water', 'supply', 'pipe', 'leak', 'contamination', 'shortage', 'sewage', 'drainage', 'flooding', 'waterlog'],
  'Electricity': ['electricity', 'power', 'outage', 'blackout', 'voltage', 'meter', 'wire', 'transformer', 'electric', 'light'],
  'Sanitation': ['garbage', 'waste', 'trash', 'sanitation', 'cleanliness', 'dirty', 'litter', 'dump', 'rubbish', 'hygiene'],
  'Public Safety': ['crime', 'safety', 'police', 'theft', 'robbery', 'assault', 'violence', 'security', 'vandalism', 'harassment'],
  'Healthcare': ['hospital', 'health', 'medical', 'doctor', 'medicine', 'clinic', 'ambulance', 'treatment', 'nurse', 'patient'],
  'Education': ['school', 'education', 'teacher', 'student', 'college', 'university', 'class', 'library', 'curriculum', 'fees'],
  'Transportation': ['bus', 'train', 'metro', 'transport', 'vehicle', 'route', 'schedule', 'fare', 'station', 'parking'],
  'Environment': ['pollution', 'environment', 'air quality', 'noise', 'tree', 'park', 'green', 'waste disposal', 'smoke', 'toxic'],
  'Public Services': ['office', 'service', 'government', 'official', 'document', 'certificate', 'license', 'permit', 'delay', 'queue'],
};

const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  'hi': /[\u0900-\u097F]/,
  'ar': /[\u0600-\u06FF]/,
  'zh': /[\u4E00-\u9FFF]/,
  'ja': /[\u3040-\u30FF]/,
  'ko': /[\uAC00-\uD7AF]/,
  'ru': /[\u0400-\u04FF]/,
  'de': /\b(und|der|die|das|ist|von|zu|in|auf|mit|für|dass|aber|oder|nicht|auch|noch|bei|nach|aus|zum|zur)\b/i,
  'fr': /\b(le|la|les|de|du|des|un|une|et|est|en|que|qui|par|sur|avec|dans|pour|il|elle|nous|vous|ils)\b/i,
  'es': /\b(el|la|los|las|de|del|un|una|y|en|que|por|con|para|es|son|fue|ser|como|más|pero|si|no)\b/i,
};

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  keywords: string[];
  topics: string[];
  isSpam: boolean;
  spamScore: number;
  urgencyScore: number;
  isUrgent: boolean;
  language: string;
  summary: string;
  recommendations: string[];
  toxicityScore: number;
  subjectivity: number;
  analyzedAt: Date;
}

const detectLanguage = (text: string): string => {
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(text)) return lang;
  }
  return 'en';
};

const extractKeywords = (text: string): string[] => {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'this', 'that', 'these', 'those', 'it', 'its',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they',
    'very', 'really', 'just', 'also', 'please', 'thank',
  ]);

  const keywords: string[] = [];
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  
  const wordFreq: Record<string, number> = {};
  tokens.forEach((token) => {
    if (token.length > 3 && !stopWords.has(token) && /^[a-z]+$/.test(token)) {
      wordFreq[token] = (wordFreq[token] || 0) + 1;
    }
  });

  const sorted = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);

  keywords.push(...sorted);
  return [...new Set(keywords)].slice(0, 10);
};

const classifyTopics = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  const matchedTopics: Array<{ topic: string; score: number }> = [];

  for (const [topic, keywords] of Object.entries(TOPIC_PATTERNS)) {
    let score = 0;
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) score += 1;
    });
    if (score > 0) {
      matchedTopics.push({ topic, score });
    }
  }

  return matchedTopics
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((t) => t.topic);
};

const detectSpam = (text: string): { isSpam: boolean; spamScore: number } => {
  const lowerText = text.toLowerCase();
  let spamScore = 0;

  SPAM_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) spamScore += 20;
  });

  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern) || [];
  spamScore += urls.length * 15;

  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.4) spamScore += 20;

  if (text.length < 20) spamScore += 30;

  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 3) spamScore += 10;

  const repeats = (text.match(/(.)\1{3,}/g) || []).length;
  if (repeats > 0) spamScore += 10;

  spamScore = Math.min(100, spamScore);
  return { isSpam: spamScore >= 60, spamScore };
};

const detectUrgency = (text: string): { isUrgent: boolean; urgencyScore: number } => {
  const lowerText = text.toLowerCase();
  let urgencyScore = 0;

  URGENT_KEYWORDS.forEach((keyword) => {
    if (lowerText.includes(keyword)) urgencyScore += 15;
  });

  if (text.includes('!')) urgencyScore += 5;
  if (/immediately|right now|asap|urgent/i.test(text)) urgencyScore += 20;

  urgencyScore = Math.min(100, urgencyScore);
  return { isUrgent: urgencyScore >= 50, urgencyScore };
};

const detectEmotions = (text: string) => {
  const lowerText = text.toLowerCase();
  const tokens = tokenizer.tokenize(lowerText) || [];

  const countMatches = (keywords: string[]): number => {
    let count = 0;
    keywords.forEach((kw) => {
      if (lowerText.includes(kw)) count++;
    });
    return count;
  };

  const angerCount = countMatches(ANGER_KEYWORDS);
  const joyCount = countMatches(JOY_KEYWORDS);
  const fearCount = countMatches(FEAR_KEYWORDS);
  const sadnessCount = countMatches(SADNESS_KEYWORDS);

  const total = angerCount + joyCount + fearCount + sadnessCount + 1;

  const surprise = tokens.some((t) => ['unexpected', 'surprised', 'shocked', 'wow', 'unbelievable'].includes(t)) ? 0.3 : 0.1;
  const disgust = tokens.some((t) => ['disgusting', 'disgusted', 'revolting', 'awful', 'filthy'].includes(t)) ? 0.4 : 0.05;

  return {
    joy: Math.min(1, joyCount / total),
    anger: Math.min(1, angerCount / total),
    fear: Math.min(1, fearCount / total),
    sadness: Math.min(1, sadnessCount / total),
    surprise,
    disgust,
  };
};

const generateSummary = (text: string): string => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const maxLength = 150;
  
  if (sentences.length === 0) return text.substring(0, maxLength);
  
  const firstTwoSentences = sentences.slice(0, 2).join(' ').trim();
  
  if (firstTwoSentences.length <= maxLength) return firstTwoSentences;
  return firstTwoSentences.substring(0, maxLength) + '...';
};

const generateRecommendations = (
  sentiment: string,
  topics: string[],
  isUrgent: boolean,
  emotions: Record<string, number>
): string[] => {
  const recommendations: string[] = [];

  if (isUrgent) {
    recommendations.push('Escalate immediately to department head for urgent attention');
    recommendations.push('Assign to on-call emergency response team');
  }

  if (sentiment === 'negative' && emotions.anger > 0.3) {
    recommendations.push('Prioritize citizen communication to address concerns');
    recommendations.push('Schedule follow-up within 24 hours');
  }

  if (topics.includes('Road & Infrastructure')) {
    recommendations.push('Inspect and assess road damage with field team');
    recommendations.push('Coordinate with Public Works Department for repair schedule');
  }

  if (topics.includes('Water Supply')) {
    recommendations.push('Dispatch water supply team for immediate inspection');
    recommendations.push('Notify affected area residents about timeline');
  }

  if (topics.includes('Public Safety')) {
    recommendations.push('Alert local law enforcement immediately');
    recommendations.push('Document incident for security review');
  }

  if (topics.includes('Healthcare')) {
    recommendations.push('Connect with Health Department for medical assistance');
    recommendations.push('Verify if emergency services are required');
  }

  if (recommendations.length === 0) {
    recommendations.push('Review feedback and assign to relevant department officer');
    recommendations.push('Respond to citizen within 3-5 business days');
    recommendations.push('Document resolution for performance metrics');
  }

  return recommendations.slice(0, 5);
};

export const analyzeText = async (title: string, description: string): Promise<IAIAnalysis> => {
  const fullText = `${title} ${description}`;
  
  const tokens = tokenizer.tokenize(fullText.toLowerCase()) || [];
  const sentimentScore = analyzer.getSentiment(tokens);
  
  const normalizedScore = Math.max(-1, Math.min(1, sentimentScore / 5));
  
  let sentiment: 'positive' | 'negative' | 'neutral';
  if (normalizedScore > 0.1) sentiment = 'positive';
  else if (normalizedScore < -0.1) sentiment = 'negative';
  else sentiment = 'neutral';

  const emotions = detectEmotions(fullText);
  const keywords = extractKeywords(fullText);
  const topics = classifyTopics(fullText);
  const { isSpam, spamScore } = detectSpam(fullText);
  const { isUrgent, urgencyScore } = detectUrgency(fullText);
  const language = detectLanguage(fullText);
  const summary = generateSummary(description);
  const recommendations = generateRecommendations(sentiment, topics, isUrgent, emotions);

  const toxicWords = ['idiot', 'stupid', 'hate', 'kill', 'die', 'damn', 'hell', 'crap'];
  const toxicityScore = Math.min(
    100,
    toxicWords.filter((w) => fullText.toLowerCase().includes(w)).length * 20
  );

  const subjectiveWords = ['i think', 'i feel', 'i believe', 'in my opinion', 'seems', 'appears', 'probably', 'maybe'];
  const subjectivity = Math.min(
    1,
    subjectiveWords.filter((w) => fullText.toLowerCase().includes(w)).length * 0.2
  );

  return {
    sentiment,
    sentimentScore: parseFloat(normalizedScore.toFixed(3)),
    emotions,
    keywords,
    topics: topics.length > 0 ? topics : ['General Feedback'],
    isSpam,
    spamScore,
    urgencyScore,
    isUrgent,
    language,
    summary,
    recommendations,
    toxicityScore,
    subjectivity,
    analyzedAt: new Date(),
  };
};

export const detectTrends = async (texts: string[]): Promise<string[]> => {
  const tfidf = new TfIdf();
  texts.forEach((text) => tfidf.addDocument(text));

  const topTerms: string[] = [];
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);

  tfidf.listTerms(0).forEach((item) => {
    if (!stopWords.has(item.term) && item.term.length > 3) {
      topTerms.push(item.term);
    }
  });

  return topTerms.slice(0, 10);
};
