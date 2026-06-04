// Gujarati learning data based on Krashen's Comprehensible Input / Natural Approach
// Levels: i, i+1, i+2 — progressively more complex
// Categories: Swar (Vowels), Vyanjan (Consonants), Words, Phrases, Stories

export interface LetterItem {
  gujarati: string;
  roman: string;
  example: string;
  exampleRoman: string;
  exampleEnglish: string;
  category: 'swar' | 'vyanjan' | 'barakhadi';
  level: number; // 1=i, 2=i+1, 3=i+2
}

export interface WordItem {
  gujarati: string;
  roman: string;
  english: string;
  category: 'animal' | 'fruit' | 'color' | 'body' | 'family' | 'food' | 'nature' | 'number' | 'greeting';
  level: number;
}

export interface PhraseItem {
  gujarati: string;
  roman: string;
  english: string;
  category: 'greeting' | 'question' | 'daily' | 'polite' | 'emotion';
  level: number;
}

export interface StoryItem {
  id: string;
  titleGujarati: string;
  titleEnglish: string;
  lines: Array<{ gujarati: string; roman: string; english: string }>;
  level: number;
}

// ===== SWAR (VOWELS) =====
export const swar: LetterItem[] = [
  { gujarati: 'અ', roman: 'a', example: 'અનાર', exampleRoman: 'anar', exampleEnglish: 'pomegranate', category: 'swar', level: 1 },
  { gujarati: 'આ', roman: 'aa', example: 'આંબલી', exampleRoman: 'aambli', exampleEnglish: 'tamarind', category: 'swar', level: 1 },
  { gujarati: 'ઇ', roman: 'i', example: 'ઇમલી', exampleRoman: 'imli', exampleEnglish: 'tamarind', category: 'swar', level: 1 },
  { gujarati: 'ઈ', roman: 'ii', example: 'ઈંટ', exampleRoman: 'iint', exampleEnglish: 'brick', category: 'swar', level: 1 },
  { gujarati: 'ઉ', roman: 'u', example: 'ઉંદર', exampleRoman: 'undar', exampleEnglish: 'mouse', category: 'swar', level: 1 },
  { gujarati: 'ઊ', roman: 'uu', example: 'ઊંટ', exampleRoman: 'uunt', exampleEnglish: 'camel', category: 'swar', level: 2 },
  { gujarati: 'ઋ', roman: 'ru', example: 'ઋષિ', exampleRoman: 'rushi', exampleEnglish: 'sage', category: 'swar', level: 2 },
  { gujarati: 'એ', roman: 'e', example: 'એક', exampleRoman: 'ek', exampleEnglish: 'one', category: 'swar', level: 1 },
  { gujarati: 'ઐ', roman: 'ai', example: 'ઐરાવત', exampleRoman: 'airavat', exampleEnglish: 'elephant of Indra', category: 'swar', level: 2 },
  { gujarati: 'ઓ', roman: 'o', example: 'ઓળખ', exampleRoman: 'olkh', exampleEnglish: 'identity', category: 'swar', level: 2 },
  { gujarati: 'ઔ', roman: 'au', example: 'ઔષધ', exampleRoman: 'aushadh', exampleEnglish: 'medicine', category: 'swar', level: 2 },
  { gujarati: 'અં', roman: 'am', example: 'અંગૂર', exampleRoman: 'angoor', exampleEnglish: 'grapes', category: 'swar', level: 3 },
  { gujarati: 'અઃ', roman: 'ah', example: 'અઃહઃ', exampleRoman: 'ahah', exampleEnglish: 'sigh', category: 'swar', level: 3 },
];

// ===== VYANJAN (CONSONANTS) =====
export const vyanjan: LetterItem[] = [
  { gujarati: 'ક', roman: 'ka', example: 'કબૂતર', exampleRoman: 'kabutar', exampleEnglish: 'pigeon', category: 'vyanjan', level: 1 },
  { gujarati: 'ખ', roman: 'kha', example: 'ખાટલી', exampleRoman: 'khatli', exampleEnglish: 'bed', category: 'vyanjan', level: 1 },
  { gujarati: 'ગ', roman: 'ga', example: 'ગાય', exampleRoman: 'gaay', exampleEnglish: 'cow', category: 'vyanjan', level: 1 },
  { gujarati: 'ઘ', roman: 'gha', example: 'ઘર', exampleRoman: 'ghar', exampleEnglish: 'house', category: 'vyanjan', level: 1 },
  { gujarati: 'ચ', roman: 'cha', example: 'ચમચમ', exampleRoman: 'chamcham', exampleEnglish: 'sparkle', category: 'vyanjan', level: 1 },
  { gujarati: 'છ', roman: 'chha', example: 'છત્રી', exampleRoman: 'chhatri', exampleEnglish: 'umbrella', category: 'vyanjan', level: 1 },
  { gujarati: 'જ', roman: 'ja', example: 'જળ', exampleRoman: 'jal', exampleEnglish: 'water', category: 'vyanjan', level: 1 },
  { gujarati: 'ઝ', roman: 'jha', example: 'ઝાડ', exampleRoman: 'jhad', exampleEnglish: 'tree', category: 'vyanjan', level: 2 },
  { gujarati: 'ટ', roman: 'ta', example: 'ટમેટા', exampleRoman: 'tameta', exampleEnglish: 'tomato', category: 'vyanjan', level: 1 },
  { gujarati: 'ઠ', roman: 'tha', example: 'ઠંડા', exampleRoman: 'thanda', exampleEnglish: 'cold', category: 'vyanjan', level: 2 },
  { gujarati: 'ડ', roman: 'da', example: 'ડુક્કર', exampleRoman: 'dukkar', exampleEnglish: 'pig', category: 'vyanjan', level: 1 },
  { gujarati: 'ઢ', roman: 'dha', example: 'ઢોલ', exampleRoman: 'dhol', exampleEnglish: 'drum', category: 'vyanjan', level: 2 },
  { gujarati: 'ણ', roman: 'na', example: 'ણગણ', exampleRoman: 'nagan', exampleEnglish: 'count', category: 'vyanjan', level: 2 },
  { gujarati: 'ત', roman: 'ta', example: 'તારા', exampleRoman: 'tara', exampleEnglish: 'stars', category: 'vyanjan', level: 1 },
  { gujarati: 'થ', roman: 'tha', example: 'થાળી', exampleRoman: 'thali', exampleEnglish: 'plate', category: 'vyanjan', level: 2 },
  { gujarati: 'દ', roman: 'da', example: 'દરિયો', exampleRoman: 'dariyo', exampleEnglish: 'sea', category: 'vyanjan', level: 2 },
  { gujarati: 'ધ', roman: 'dha', example: 'ધન', exampleRoman: 'dhan', exampleEnglish: 'wealth', category: 'vyanjan', level: 2 },
  { gujarati: 'ન', roman: 'na', example: 'નદી', exampleRoman: 'nadi', exampleEnglish: 'river', category: 'vyanjan', level: 1 },
  { gujarati: 'પ', roman: 'pa', example: 'પાણી', exampleRoman: 'paani', exampleEnglish: 'water', category: 'vyanjan', level: 1 },
  { gujarati: 'ફ', roman: 'pha', example: 'ફૂલ', exampleRoman: 'phool', exampleEnglish: 'flower', category: 'vyanjan', level: 1 },
  { gujarati: 'બ', roman: 'ba', example: 'બાળક', exampleRoman: 'baalak', exampleEnglish: 'child', category: 'vyanjan', level: 1 },
  { gujarati: 'ભ', roman: 'bha', example: 'ભેંસ', exampleRoman: 'bhens', exampleEnglish: 'buffalo', category: 'vyanjan', level: 2 },
  { gujarati: 'મ', roman: 'ma', example: 'માતા', exampleRoman: 'mata', exampleEnglish: 'mother', category: 'vyanjan', level: 1 },
  { gujarati: 'ય', roman: 'ya', example: 'યશ', exampleRoman: 'yash', exampleEnglish: 'fame', category: 'vyanjan', level: 2 },
  { gujarati: 'ર', roman: 'ra', example: 'રાજા', exampleRoman: 'raja', exampleEnglish: 'king', category: 'vyanjan', level: 1 },
  { gujarati: 'લ', roman: 'la', example: 'લીમડો', exampleRoman: 'limdo', exampleEnglish: 'neem tree', category: 'vyanjan', level: 2 },
  { gujarati: 'વ', roman: 'va', example: 'વાંસ', exampleRoman: 'vaans', exampleEnglish: 'bamboo', category: 'vyanjan', level: 2 },
  { gujarati: 'શ', roman: 'sha', example: 'શહેર', exampleRoman: 'shaher', exampleEnglish: 'city', category: 'vyanjan', level: 2 },
  { gujarati: 'ષ', roman: 'sha', example: 'ષટકોણ', exampleRoman: 'shatkon', exampleEnglish: 'hexagon', category: 'vyanjan', level: 3 },
  { gujarati: 'સ', roman: 'sa', example: 'સવાર', exampleRoman: 'savar', exampleEnglish: 'morning', category: 'vyanjan', level: 1 },
  { gujarati: 'હ', roman: 'ha', example: 'હાથી', exampleRoman: 'hathi', exampleEnglish: 'elephant', category: 'vyanjan', level: 1 },
  { gujarati: 'ળ', roman: 'la', example: 'ળવવું', exampleRoman: 'lavvu', exampleEnglish: 'to take', category: 'vyanjan', level: 3 },
  { gujarati: 'ક્ષ', roman: 'ksha', example: 'ક્ષમા', exampleRoman: 'kshama', exampleEnglish: 'forgiveness', category: 'vyanjan', level: 3 },
  { gujarati: 'જ્ઞ', roman: 'jna', example: 'જ્ઞાન', exampleRoman: 'jnan', exampleEnglish: 'knowledge', category: 'vyanjan', level: 3 },
];

// ===== NUMBERS =====
export const numbers: WordItem[] = [
  { gujarati: '૦', roman: 'shunya', english: 'Zero', category: 'number', level: 1 },
  { gujarati: '૧', roman: 'ek', english: 'One', category: 'number', level: 1 },
  { gujarati: '૨', roman: 'be', english: 'Two', category: 'number', level: 1 },
  { gujarati: '૩', roman: 'tran', english: 'Three', category: 'number', level: 1 },
  { gujarati: '૪', roman: 'char', english: 'Four', category: 'number', level: 1 },
  { gujarati: '૫', roman: 'paanch', english: 'Five', category: 'number', level: 1 },
  { gujarati: '૬', roman: 'cha', english: 'Six', category: 'number', level: 2 },
  { gujarati: '૭', roman: 'saat', english: 'Seven', category: 'number', level: 2 },
  { gujarati: '૮', roman: 'aath', english: 'Eight', category: 'number', level: 2 },
  { gujarati: '૯', roman: 'nav', english: 'Nine', category: 'number', level: 2 },
  { gujarati: '૧૦', roman: 'das', english: 'Ten', category: 'number', level: 2 },
];

// ===== WORDS =====
export const words: WordItem[] = [
  // Animals - Level 1
  { gujarati: 'ગાય', roman: 'gaay', english: 'Cow', category: 'animal', level: 1 },
  { gujarati: 'બિલાડી', roman: 'biladi', english: 'Cat', category: 'animal', level: 1 },
  { gujarati: 'કૂતરો', roman: 'kutro', english: 'Dog', category: 'animal', level: 1 },
  { gujarati: 'હાથી', roman: 'hathi', english: 'Elephant', category: 'animal', level: 1 },
  { gujarati: 'સિંહ', roman: 'sinh', english: 'Lion', category: 'animal', level: 2 },
  { gujarati: 'વાંદર', roman: 'vandar', english: 'Monkey', category: 'animal', level: 2 },
  { gujarati: 'મોર', roman: 'mor', english: 'Peacock', category: 'animal', level: 2 },
  { gujarati: 'માછલી', roman: 'machhli', english: 'Fish', category: 'animal', level: 1 },
  { gujarati: 'પક્ષી', roman: 'pakshi', english: 'Bird', category: 'animal', level: 2 },
  { gujarati: 'ખાચર', roman: 'khachar', english: 'Donkey', category: 'animal', level: 3 },

  // Fruits - Level 1
  { gujarati: 'સફરજન', roman: 'safarjan', english: 'Apple', category: 'fruit', level: 1 },
  { gujarati: 'દ્રાક્ષ', roman: 'draksh', english: 'Grapes', category: 'fruit', level: 1 },
  { gujarati: 'કેળું', roman: 'kelun', english: 'Banana', category: 'fruit', level: 1 },
  { gujarati: 'મામેલું', roman: 'mamelun', english: 'Mango', category: 'fruit', level: 1 },
  { gujarati: 'નાળિયેર', roman: 'naliyer', english: 'Coconut', category: 'fruit', level: 2 },
  { gujarati: 'પપૈયું', roman: 'papaiyun', english: 'Papaya', category: 'fruit', level: 2 },
  { gujarati: 'અનાર', roman: 'anar', english: 'Pomegranate', category: 'fruit', level: 2 },
  { gujarati: 'સંતરું', roman: 'santrun', english: 'Orange', category: 'fruit', level: 1 },

  // Colors - Level 1
  { gujarati: 'લાલ', roman: 'laal', english: 'Red', category: 'color', level: 1 },
  { gujarati: 'વાદળી', roman: 'vaadali', english: 'Blue', category: 'color', level: 1 },
  { gujarati: 'લીલો', roman: 'lilo', english: 'Green', category: 'color', level: 1 },
  { gujarati: 'પીળો', roman: 'pilo', english: 'Yellow', category: 'color', level: 1 },
  { gujarati: 'સફેદ', roman: 'safed', english: 'White', category: 'color', level: 1 },
  { gujarati: 'કાળો', roman: 'kaalo', english: 'Black', category: 'color', level: 1 },
  { gujarati: 'નારંગી', roman: 'narangi', english: 'Orange', category: 'color', level: 2 },
  { gujarati: 'જાંબલી', roman: 'jaambli', english: 'Purple', category: 'color', level: 2 },

  // Family - Level 1
  { gujarati: 'માતા', roman: 'mata', english: 'Mother', category: 'family', level: 1 },
  { gujarati: 'પિતા', roman: 'pita', english: 'Father', category: 'family', level: 1 },
  { gujarati: 'બહેન', roman: 'bahen', english: 'Sister', category: 'family', level: 1 },
  { gujarati: 'ભાઈ', roman: 'bhai', english: 'Brother', category: 'family', level: 1 },
  { gujarati: 'દાદી', roman: 'dadi', english: 'Grandmother', category: 'family', level: 2 },
  { gujarati: 'દાદા', roman: 'dada', english: 'Grandfather', category: 'family', level: 2 },

  // Body parts - Level 1
  { gujarati: 'હાથ', roman: 'haath', english: 'Hand', category: 'body', level: 1 },
  { gujarati: 'પગ', roman: 'pag', english: 'Foot', category: 'body', level: 1 },
  { gujarati: 'આંખ', roman: 'aankh', english: 'Eye', category: 'body', level: 1 },
  { gujarati: 'નાક', roman: 'naak', english: 'Nose', category: 'body', level: 1 },
  { gujarati: 'કાન', roman: 'kaan', english: 'Ear', category: 'body', level: 1 },
  { gujarati: 'મોઢું', roman: 'modhun', english: 'Mouth', category: 'body', level: 2 },

  // Food - Level 1
  { gujarati: 'રોટલી', roman: 'rotli', english: 'Bread', category: 'food', level: 1 },
  { gujarati: 'દાળ', roman: 'daal', english: 'Lentils', category: 'food', level: 1 },
  { gujarati: 'ભાત', roman: 'bhaat', english: 'Rice', category: 'food', level: 1 },
  { gujarati: 'દહીં', roman: 'dahin', english: 'Yogurt', category: 'food', level: 1 },
  { gujarati: 'ઘી', roman: 'ghi', english: 'Ghee', category: 'food', level: 2 },
  { gujarati: 'ચા', roman: 'cha', english: 'Tea', category: 'food', level: 1 },
  { gujarati: 'દૂધ', roman: 'doodh', english: 'Milk', category: 'food', level: 1 },

  // Nature - Level 1-2
  { gujarati: 'સૂરજ', roman: 'suraj', english: 'Sun', category: 'nature', level: 1 },
  { gujarati: 'ચંદ્ર', roman: 'chandr', english: 'Moon', category: 'nature', level: 1 },
  { gujarati: 'તારા', roman: 'tara', english: 'Stars', category: 'nature', level: 1 },
  { gujarati: 'વાદળ', roman: 'vaadal', english: 'Cloud', category: 'nature', level: 2 },
  { gujarati: 'પાણી', roman: 'paani', english: 'Water', category: 'nature', level: 1 },
  { gujarati: 'અગ્નિ', roman: 'agni', english: 'Fire', category: 'nature', level: 2 },
  { gujarati: 'પૃથ્વી', roman: 'pruthvi', english: 'Earth', category: 'nature', level: 2 },
];

// ===== PHRASES =====
export const phrases: PhraseItem[] = [
  // Greetings - Level 1
  { gujarati: 'નમસ્તે', roman: 'namaste', english: 'Hello', category: 'greeting', level: 1 },
  { gujarati: 'કેમ છો?', roman: 'kem chho?', english: 'How are you?', category: 'greeting', level: 1 },
  { gujarati: 'મારું નામ ___ છે', roman: 'marun naam ___ chhe', english: 'My name is ___', category: 'greeting', level: 1 },
  { gujarati: 'આવજો', roman: 'aavjo', english: 'Welcome / Come', category: 'greeting', level: 1 },
  { gujarati: 'અલવિદા', roman: 'alvida', english: 'Goodbye', category: 'greeting', level: 1 },

  // Questions - Level 2
  { gujarati: 'શું નામ છે?', roman: 'shun naam chhe?', english: 'What is your name?', category: 'question', level: 2 },
  { gujarati: 'તમે ક્યાં રહો છો?', roman: 'tame kyaan rahvo chho?', english: 'Where do you live?', category: 'question', level: 3 },
  { gujarati: 'આ શું છે?', roman: 'aa shun chhe?', english: 'What is this?', category: 'question', level: 2 },
  { gujarati: 'કેટલા વાગ્યા?', roman: 'ketla vaagya?', english: 'What time is it?', category: 'question', level: 3 },

  // Daily - Level 1
  { gujarati: 'સુપ્રભાત', roman: 'suprabhat', english: 'Good morning', category: 'daily', level: 1 },
  { gujarati: 'શુભ રાત્રી', roman: 'shubh ratri', english: 'Good night', category: 'daily', level: 1 },
  { gujarati: 'મને ભૂખ લાગી છે', roman: 'mane bhookh laagi chhe', english: 'I am hungry', category: 'daily', level: 2 },
  { gujarati: 'મને તરસ લાગી છે', roman: 'mane taras laagi chhe', english: 'I am thirsty', category: 'daily', level: 2 },

  // Polite - Level 1
  { gujarati: 'આભાર', roman: 'aabhar', english: 'Thank you', category: 'polite', level: 1 },
  { gujarati: 'કૃપા કરીને', roman: 'krupa karine', english: 'Please', category: 'polite', level: 2 },
  { gujarati: 'માફ કરજો', roman: 'maaf karjo', english: 'Sorry / Excuse me', category: 'polite', level: 2 },
  { gujarati: 'હા', roman: 'haa', english: 'Yes', category: 'polite', level: 1 },
  { gujarati: 'ના', roman: 'naa', english: 'No', category: 'polite', level: 1 },

  // Emotions - Level 2
  { gujarati: 'હું ખુશ છું', roman: 'hu khush chhu', english: 'I am happy', category: 'emotion', level: 2 },
  { gujarati: 'હું દુઃખી છું', roman: 'hu dukkhi chhu', english: 'I am sad', category: 'emotion', level: 2 },
  { gujarati: 'મને ગુસ્સો આવે છે', roman: 'mane gusso aave chhe', english: 'I am angry', category: 'emotion', level: 3 },
];

// ===== STORIES (Comprehensible Input - meaningful context) =====
export const stories: StoryItem[] = [
  {
    id: 'lion-mouse',
    titleGujarati: 'સિંહ અને ચૂહો',
    titleEnglish: 'The Lion and the Mouse',
    level: 1,
    lines: [
      { gujarati: 'એક સિંહ હતો.', roman: 'ek sinh hato.', english: 'There was a lion.' },
      { gujarati: 'સિંહ ઊંઘતો હતો.', roman: 'sinh unhto hato.', english: 'The lion was sleeping.' },
      { gujarati: 'એક ચૂહો દોડ્યો.', roman: 'ek choho dodyo.', english: 'A mouse ran.' },
      { gujarati: 'ચૂહો સિંહ પર કૂદ્યો!', roman: 'choho sinh par kudyo!', english: 'The mouse jumped on the lion!' },
      { gujarati: 'સિંહ જાગ્યો.', roman: 'sinh jaagyo.', english: 'The lion woke up.' },
      { gujarati: 'સિંહ ગુસ્સે થયો.', roman: 'sinh gusse thayo.', english: 'The lion became angry.' },
      { gujarati: 'ચૂહો બોલ્યો, "મને છોડી દો!"', roman: 'choho bolyo, "mane chhodi do!"', english: 'The mouse said, "Let me go!"' },
      { gujarati: 'સિંહે ચૂહાને છોડી દીધો.', roman: 'sinhe chhuhane chhodi didho.', english: 'The lion let the mouse go.' },
      { gujarati: 'એક દિવસ સિંહ જાળમાં ફસાયો.', roman: 'ek divas sinh jaalmaan fasaayo.', english: 'One day the lion got caught in a net.' },
      { gujarati: 'ચૂહો આવ્યો અને જાળ કાપી નાખી.', roman: 'choho aavyo ane jaal kaapi naakhi.', english: 'The mouse came and cut the net.' },
      { gujarati: 'સિંહ મુક્ત થયો!', roman: 'sinh mukt thayo!', english: 'The lion was free!' },
      { gujarati: 'નાનો મિત્ર પણ મોટો મદદગાર.', roman: 'nano mitr pan moto madadgaar.', english: 'A small friend is also a big helper.' },
    ],
  },
  {
    id: 'hungry-cat',
    titleGujarati: 'ભૂખ્યો બિલાડી',
    titleEnglish: 'The Hungry Cat',
    level: 1,
    lines: [
      { gujarati: 'એક બિલાડી હતી.', roman: 'ek biladi hati.', english: 'There was a cat.' },
      { gujarati: 'બિલાડી ભૂખ્યી હતી.', roman: 'biladi bhookhi hati.', english: 'The cat was hungry.' },
      { gujarati: 'તેણે માછલી શોધી.', roman: 'tene machhli shodhi.', english: 'She searched for fish.' },
      { gujarati: 'તેને એક મોટી માછલી મળી!', roman: 'tene ek moti machhli mali!', english: 'She found a big fish!' },
      { gujarati: 'બિલાડી ખુશ થઈ.', roman: 'biladi khush thi.', english: 'The cat became happy.' },
      { gujarati: 'તેણે માછલી ખાધી.', roman: 'tene machhli khaadhi.', english: 'She ate the fish.' },
      { gujarati: 'હવે બિલાડી તૃપ્ત છે!', roman: 'have biladi trupt chhe!', english: 'Now the cat is satisfied!' },
    ],
  },
  {
    id: 'sun-moon',
    titleGujarati: 'સૂરજ અને ચંદ્ર',
    titleEnglish: 'The Sun and the Moon',
    level: 2,
    lines: [
      { gujarati: 'સૂરજ અને ચંદ્ર ભાઈ હતા.', roman: 'suraj ane chandr bhai hata.', english: 'The Sun and Moon were brothers.' },
      { gujarati: 'સૂરજ દિવસે કામ કરે છે.', roman: 'suraj divase kaam kare chhe.', english: 'The Sun works during the day.' },
      { gujarati: 'ચંદ્ર રાત્રે ચમકે છે.', roman: 'chandr raatre chamke chhe.', english: 'The Moon shines at night.' },
      { gujarati: 'સૂરજ ગરમ છે.', roman: 'suraj garam chhe.', english: 'The Sun is hot.' },
      { gujarati: 'ચંદ્ર ઠંડો છે.', roman: 'chandr thando chhe.', english: 'The Moon is cool.' },
      { gujarati: 'બંને સાથે મળીને દુનિયાને પ્રકાશ આપે છે.', roman: 'banne saathe maliine duniyane prakaash aape chhe.', english: 'Together they give light to the world.' },
    ],
  },
];

// ===== CATEGORY METADATA =====
export const categoryMeta: Record<string, { emoji: string; label: string; color: string }> = {
  animal: { emoji: '🦁', label: 'Animals', color: '#F59E0B' },
  fruit: { emoji: '🍎', label: 'Fruits', color: '#EF4444' },
  color: { emoji: '🎨', label: 'Colors', color: '#8B5CF6' },
  body: { emoji: '🤚', label: 'Body Parts', color: '#EC4899' },
  family: { emoji: '👨‍👩‍👧‍👦', label: 'Family', color: '#F97316' },
  food: { emoji: '🍛', label: 'Food', color: '#10B981' },
  nature: { emoji: '🌿', label: 'Nature', color: '#06B6D4' },
  number: { emoji: '🔢', label: 'Numbers', color: '#3B82F6' },
  greeting: { emoji: '👋', label: 'Greetings', color: '#F59E0B' },
  question: { emoji: '❓', label: 'Questions', color: '#6366F1' },
  daily: { emoji: '☀️', label: 'Daily', color: '#14B8A6' },
  polite: { emoji: '🙏', label: 'Polite', color: '#A855F7' },
  emotion: { emoji: '😊', label: 'Emotions', color: '#F43F5E' },
  swar: { emoji: '🔊', label: 'Vowels (સ્વર)', color: '#3B82F6' },
  vyanjan: { emoji: '🔤', label: 'Consonants (વ્યંજન)', color: '#8B5CF6' },
};

// ===== QUIZ QUESTIONS GENERATOR =====
export function generateQuiz(type: 'letter' | 'word' | 'phrase', level: number, count: number = 5) {
  const questions: Array<{ question: string; options: string[]; answer: number; gujarati: string }> = [];

  if (type === 'letter') {
    const pool = [...swar, ...vyanjan].filter(l => l.level <= level);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
    for (const letter of shuffled) {
      const wrongOptions = pool
        .filter(l => l.gujarati !== letter.gujarati)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(l => l.roman);
      const options = [...wrongOptions, letter.roman].sort(() => Math.random() - 0.5);
      questions.push({
        question: `What sound does "${letter.gujarati}" make?`,
        options,
        answer: options.indexOf(letter.roman),
        gujarati: letter.gujarati,
      });
    }
  } else if (type === 'word') {
    const pool = words.filter(w => w.level <= level);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
    for (const word of shuffled) {
      const wrongOptions = pool
        .filter(w => w.gujarati !== word.gujarati)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.english);
      const options = [...wrongOptions, word.english].sort(() => Math.random() - 0.5);
      questions.push({
        question: `What does "${word.gujarati}" mean?`,
        options,
        answer: options.indexOf(word.english),
        gujarati: word.gujarati,
      });
    }
  } else if (type === 'phrase') {
    const pool = phrases.filter(p => p.level <= level);
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
    for (const phrase of shuffled) {
      const wrongOptions = phrases
        .filter(p => p.gujarati !== phrase.gujarati)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(p => p.english);
      const options = [...wrongOptions, phrase.english].sort(() => Math.random() - 0.5);
      questions.push({
        question: `What does "${phrase.gujarati}" mean?`,
        options,
        answer: options.indexOf(phrase.english),
        gujarati: phrase.gujarati,
      });
    }
  }

  return questions;
}
