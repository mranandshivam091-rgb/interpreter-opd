// Built-in mini glossary for demo mode (no translation provider configured).
// Each phrase lists every surface form we expect to see per language (Devanagari
// Hindi, romanized Hindi, Tamil script, English). A match requires every word of
// the matched surface form to appear in the spoken text, so minor extra words
// ("bahut zyada" around "pet dard") don't break the match. Works both directions
// (hi<->ta<->en), so a doctor's Tamil question matches back to Hindi too.
// Anything that doesn't match is passed through untranslated and flagged
// "doubtful" so the UI never guesses silently.
export type Lang = "hi" | "ta" | "en";

interface Phrase {
  hi: string[];
  ta: string[];
  en: string[];
}

const PHRASES: Phrase[] = [
  { hi: ["नमस्ते", "namaste"], ta: ["வணக்கம்"], en: ["hello"] },
  { hi: ["कैसे हैं आप", "aap kaise hain", "kaise hain aap"], ta: ["எப்படி இருக்கிறீர்கள்", "eppadi irukkinga"], en: ["how are you"] },
  { hi: ["पेट में दर्द है", "पेट दर्द", "pet mein dard hai", "pet dard"], ta: ["வயிற்று வலி இருக்கிறது", "வயிறு வலி"], en: ["stomach pain"] },
  { hi: ["बुखार है", "बुखार", "bukhar hai", "bukhar"], ta: ["காய்ச்சல் இருக்கிறது", "காய்ச்சல்"], en: ["fever"] },
  { hi: ["सिर दर्द है", "सिर में दर्द", "sir dard hai", "sar dard"], ta: ["தலைவலி இருக்கிறது", "தலைவலி"], en: ["headache"] },
  { hi: ["उल्टी हो रही है", "उल्टी", "ulti ho rahi hai", "ulti"], ta: ["வாந்தி எடுக்கிறது", "வாந்தி"], en: ["vomiting"] },
  { hi: ["खांसी है", "खांसी", "khansi hai", "khansi"], ta: ["இருமல் இருக்கிறது", "இருமல்"], en: ["cough"] },
  { hi: ["जुकाम है", "जुकाम", "zukaam hai", "jukham"], ta: ["சளி இருக்கிறது", "சளி"], en: ["cold"] },
  { hi: ["शरीर में दर्द है", "बदन दर्द", "sharir mein dard hai", "badan dard"], ta: ["உடல் வலி இருக்கிறது", "உடம்பு வலி"], en: ["body pain"] },
  { hi: ["सीने में दर्द है", "seene mein dard hai", "chest mein dard"], ta: ["மார்பு வலி இருக்கிறது", "நெஞ்சு வலி"], en: ["chest pain"] },
  { hi: ["चक्कर आ रहा है", "चक्कर", "chakkar aa raha hai", "chakkar"], ta: ["தலைச்சுற்றல் இருக்கிறது", "தலை சுற்றல்"], en: ["dizziness"] },
  { hi: ["कमजोरी लग रही है", "कमजोरी", "kamzori lag rahi hai", "kamjori"], ta: ["சோர்வாக இருக்கிறது", "பலவீனம்"], en: ["weakness"] },
  { hi: ["कितने दिन से है", "कितने दिनों से", "kitne din se hai", "kitne dino se"], ta: ["எத்தனை நாட்களாக இருக்கிறது", "எத்தனை நாளா"], en: ["how many days"] },
  { hi: ["क्या आपको किसी दवाई से एलर्जी है", "allergy hai kya", "kya kisi dawai se allergy hai"], ta: ["உங்களுக்கு மருந்துக்கு ஒவ்வாமை உண்டா"], en: ["any allergy"] },
  { hi: ["क्या आप कोई दवाई ले रहे हैं", "koi dawai le rahe hain kya", "abhi koi dawai le rahe hain"], ta: ["நீங்கள் ஏதாவது மருந்து சாப்பிடுகிறீர்களா", "தற்போது மருந்து சாப்பிடுகிறீர்களா"], en: ["are you taking any medicine"] },
  { hi: ["सुगर की बीमारी है", "शुगर है", "sugar ki bimari hai", "sugar hai"], ta: ["சர்க்கரை நோய் இருக்கிறதா", "சுகர் இருக்கா"], en: ["diabetes"] },
  { hi: ["बीपी है", "बीपी की समस्या है", "bp hai", "bp ki samasya hai"], ta: ["ரத்த அழுத்தம் இருக்கிறதா", "பிபி இருக்கா"], en: ["blood pressure"] },
  { hi: ["क्या आप गर्भवती हैं", "pregnant hain kya", "garbhvati hain kya"], ta: ["நீங்கள் கர்ப்பமாக இருக்கிறீர்களா"], en: ["pregnant"] },
  { hi: ["क्या आप स्तनपान करा रही हैं", "breastfeeding kara rahi hain kya"], ta: ["நீங்கள் தாய்ப்பால் கொடுக்கிறீர்களா"], en: ["breastfeeding"] },
  { hi: ["बच्चे को खांसी है", "bacche ko khansi hai"], ta: ["குழந்தைக்கு இருமல் இருக்கிறது"], en: ["child has a cough"] },
  { hi: ["भूख नहीं लग रही", "bhookh nahi lag rahi"], ta: ["பசி இல்லை"], en: ["loss of appetite"] },
  { hi: ["नींद नहीं आ रही", "neend nahi aa rahi"], ta: ["தூக்கம் வரவில்லை"], en: ["can't sleep"] },
  { hi: ["खून की जांच करानी होगी", "khoon ki jaanch karani hogi"], ta: ["ரத்த பரிசோதனை செய்ய வேண்டும்"], en: ["blood test"] },
  { hi: ["एक्स रे करवाना होगा", "x-ray karwana hoga"], ta: ["எக்ஸ்ரே எடுக்க வேண்டும்"], en: ["x-ray"] },
  { hi: ["अस्पताल में भर्ती होना होगा", "aspatal mein bharti hona hoga"], ta: ["மருத்துவமனையில் அனுமதிக்க வேண்டும்"], en: ["admit in hospital"] },
  { hi: ["पांच दिन बाद वापस आइए", "paanch din baad wapas aaiye"], ta: ["ஐந்து நாட்கள் கழித்து மீண்டும் வாருங்கள்"], en: ["come back after five days"] },
  { hi: ["आराम कीजिए", "aaram kijiye"], ta: ["ஓய்வு எடுங்கள்"], en: ["take rest"] },
  { hi: ["पानी पीजिए", "paani pijiye"], ta: ["தண்ணீர் குடியுங்கள்"], en: ["drink water"] },
  { hi: ["धन्यवाद", "dhanyavad"], ta: ["நன்றி"], en: ["thank you"] },
  { hi: ["हां", "haan"], ta: ["ஆம்"], en: ["yes"] },
  { hi: ["नहीं", "nahi"], ta: ["இல்லை"], en: ["no"] },
  { hi: ["समझ गया", "samajh gaya", "theek hai"], ta: ["புரிந்தது", "சரி"], en: ["understood"] },
];

export interface TranslationResult {
  text: string;
  matched: boolean;
}

// Strips punctuation (including Hindi's danda "।"), collapses whitespace, lowercases.
function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[।,.!?;:'"()]/g, "")
    .replace(/\s+/g, " ");
}

function wordsOf(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

// A surface form matches if every one of its words appears somewhere in the
// spoken text — order-independent, tolerant of extra filler words.
function formMatches(spokenWords: string[], form: string): boolean {
  const formWords = wordsOf(form);
  return formWords.length > 0 && formWords.every((word) => spokenWords.includes(word));
}

export function translatePhrase(text: string, from: Lang, to: Lang): TranslationResult {
  const spokenWords = wordsOf(text);
  if (spokenWords.length === 0) return { text, matched: false };

  for (const phrase of PHRASES) {
    if (phrase[from].some((form) => formMatches(spokenWords, form))) {
      return { text: phrase[to][0], matched: true };
    }
  }
  return { text, matched: false };
}
