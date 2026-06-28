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
  category: 'animal' | 'fruit' | 'color' | 'body' | 'family' | 'food' | 'nature' | 'number' | 'greeting' | 'surat' | 'festival';
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
  focusWords?: Array<{ gujarati: string; roman: string; english: string }>;
  moralGujarati?: string;
  moralEnglish?: string;
  questionGujarati?: string;
  questionEnglish?: string;
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
  // Animals - Additional
  { gujarati: 'વાઘ', roman: 'vaagh', english: 'Tiger', category: 'animal', level: 1 },
  { gujarati: 'ઘોડો', roman: 'ghodo', english: 'Horse', category: 'animal', level: 1 },
  { gujarati: 'સસ્સો', roman: 'sasso', english: 'Rabbit', category: 'animal', level: 1 },
  { gujarati: 'ભેંસ', roman: 'bhens', english: 'Buffalo', category: 'animal', level: 1 },
  { gujarati: 'ઊંટ', roman: 'uunt', english: 'Camel', category: 'animal', level: 2 },
  { gujarati: 'બકરી', roman: 'bakri', english: 'Goat', category: 'animal', level: 1 },
  { gujarati: 'ઘેટું', roman: 'ghetun', english: 'Sheep', category: 'animal', level: 1 },
  { gujarati: 'ડુક્કર', roman: 'dukkar', english: 'Pig', category: 'animal', level: 2 },
  { gujarati: 'સાપ', roman: 'saap', english: 'Snake', category: 'animal', level: 2 },
  { gujarati: 'દેડકો', roman: 'dedko', english: 'Frog', category: 'animal', level: 2 },
  { gujarati: 'પોપત', roman: 'popat', english: 'Parrot', category: 'animal', level: 1 },
  { gujarati: 'ઘુવડ', roman: 'ghuvad', english: 'Owl', category: 'animal', level: 2 },
  { gujarati: 'કોયાલ', roman: 'koyal', english: 'Cuckoo', category: 'animal', level: 2 },
  { gujarati: 'બાતાક', roman: 'batak', english: 'Duck', category: 'animal', level: 1 },
  { gujarati: 'હંસ', roman: 'hans', english: 'Swan', category: 'animal', level: 2 },
  { gujarati: 'હારાન', roman: 'haran', english: 'Deer', category: 'animal', level: 2 },
  { gujarati: 'રિનચચ', roman: 'rinchh', english: 'Bear', category: 'animal', level: 2 },
  { gujarati: 'ઘાદિયાલ', roman: 'ghadiyaal', english: 'Crocodile', category: 'animal', level: 2 },
  { gujarati: 'કિદિ', roman: 'kidi', english: 'Ant', category: 'animal', level: 1 },
  { gujarati: 'માધમાખિ', roman: 'madhmakhi', english: 'Bee', category: 'animal', level: 2 },
  { gujarati: 'પતંગિયુ', roman: 'patangiyu', english: 'Butterfly', category: 'animal', level: 1 },
  { gujarati: 'કાગદો', roman: 'kagdo', english: 'Crow', category: 'animal', level: 1 },
  { gujarati: 'કાચબો', roman: 'kachbo', english: 'Tortoise', category: 'animal', level: 2 },
  { gujarati: 'ખિસસો', roman: 'khisso', english: 'Squirrel', category: 'animal', level: 2 },
  { gujarati: 'જેબરા', roman: 'zebra', english: 'Zebra', category: 'animal', level: 1 },
  { gujarati: 'જિરાફ', roman: 'jiraf', english: 'Giraffe', category: 'animal', level: 1 },
  { gujarati: 'કાબુઠાર', roman: 'kabutar', english: 'Pigeon', category: 'animal', level: 1 },
  { gujarati: 'ગારુદ', roman: 'garud', english: 'Eagle', category: 'animal', level: 2 },
  { gujarati: 'લોમદિ', roman: 'lomdi', english: 'Fox', category: 'animal', level: 2 },
  { gujarati: 'વિચચુ', roman: 'vichhu', english: 'Scorpion', category: 'animal', level: 3 },
  { gujarati: 'માચાર', roman: 'machar', english: 'Mosquito', category: 'animal', level: 2 },
  { gujarati: 'માકોદિ', roman: 'makodi', english: 'Spider', category: 'animal', level: 2 },
  { gujarati: 'ગેનદો', roman: 'gendo', english: 'Rhinoceros', category: 'animal', level: 3 },
  { gujarati: 'રાજહંસ', roman: 'rajhans', english: 'Flamingo', category: 'animal', level: 3 },
  { gujarati: 'દિપદો', roman: 'dipdo', english: 'Leopard', category: 'animal', level: 2 },
  { gujarati: 'ઉંદાર', roman: 'undar', english: 'Mouse', category: 'animal', level: 1 },
  { gujarati: 'બાગલો', roman: 'baglo', english: 'Heron', category: 'animal', level: 3 },
  { gujarati: 'તેઠુર', roman: 'tetur', english: 'Quail', category: 'animal', level: 3 },
  { gujarati: 'સિયાલ', roman: 'siyaal', english: 'Jackal', category: 'animal', level: 3 },

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

  { gujarati: 'કેરી', roman: 'keri', english: 'Mango', category: 'fruit', level: 1 },
  { gujarati: 'જામફલઅ', roman: 'jaamfal', english: 'Guava', category: 'fruit', level: 1 },
  { gujarati: 'તરભૂચ', roman: 'tarbooch', english: 'Watermelon', category: 'fruit', level: 2 },
  { gujarati: 'ખરબૂજ', roman: 'kharbuj', english: 'Muskmelon', category: 'fruit', level: 2 },
  { gujarati: 'ખારેક', roman: 'kharek', english: 'Dates', category: 'fruit', level: 2 },
  { gujarati: 'અંજીર', roman: 'anjir', english: 'Fig', category: 'fruit', level: 2 },
  { gujarati: 'જાંબૂ', roman: 'jaambu', english: 'Java Plum', category: 'fruit', level: 2 },
  { gujarati: 'ચીકુ', roman: 'chiku', english: 'Sapodilla', category: 'fruit', level: 2 },
  { gujarati: 'સીતાફલઅ', roman: 'sitafal', english: 'Custard Apple', category: 'fruit', level: 3 },
  { gujarati: 'ફણસ', roman: 'fanas', english: 'Jackfruit', category: 'fruit', level: 3 },
  { gujarati: 'અનાનસ', roman: 'ananas', english: 'Pineapple', category: 'fruit', level: 2 },
  { gujarati: 'લિંબુ', roman: 'limbu', english: 'Lemon', category: 'fruit', level: 1 },
  { gujarati: 'આંબલા', roman: 'aamla', english: 'Indian Gooseberry', category: 'fruit', level: 3 },
  { gujarati: 'આરુ', roman: 'aroo', english: 'Peach', category: 'fruit', level: 3 },
  { gujarati: 'કિવી', roman: 'kivi', english: 'Kiwi', category: 'fruit', level: 2 },
  { gujarati: 'ચેરી', roman: 'cheri', english: 'Cherry', category: 'fruit', level: 2 },
  { gujarati: 'નાશપતી', roman: 'nashpati', english: 'Pear', category: 'fruit', level: 2 },
  { gujarati: 'લીચી', roman: 'lichi', english: 'Lychee', category: 'fruit', level: 2 },
  { gujarati: 'પપૈયુ', roman: 'papaiyu', english: 'Papaya', category: 'fruit', level: 2 },
  { gujarati: 'અલુબુખારા', roman: 'alubukhara', english: 'Plum', category: 'fruit', level: 3 },
  { gujarati: 'જરદાલુ', roman: 'jardalu', english: 'Apricot', category: 'fruit', level: 3 },
  { gujarati: 'સટરમાબેરી', roman: 'strambairi', english: 'Strawberry', category: 'fruit', level: 3 },
  { gujarati: 'ગુલાબી', roman: 'gulabi', english: 'Pink', category: 'color', level: 1 },
  { gujarati: 'ભૂરો', roman: 'bhooro', english: 'Brown', category: 'color', level: 1 },
  { gujarati: 'રાખોડી', roman: 'rakhodi', english: 'Gray', category: 'color', level: 2 },
  { gujarati: 'સોનેરી', roman: 'soneri', english: 'Golden', category: 'color', level: 2 },
  { gujarati: 'રૂપેરી', roman: 'ruperi', english: 'Silver', category: 'color', level: 2 },
  { gujarati: 'મરૂન', roman: 'marun', english: 'Maroon', category: 'color', level: 2 },
  { gujarati: 'કેસરી', roman: 'kesari', english: 'Saffron', category: 'color', level: 2 },
  { gujarati: 'આસમાની', roman: 'aasmani', english: 'Sky Blue', category: 'color', level: 2 },
  { gujarati: 'જાંબુજો', roman: 'jaambudo', english: 'Purple', category: 'color', level: 2 },
  { gujarati: 'ફેરોજી', roman: 'feroji', english: 'Turquoise', category: 'color', level: 3 },
  { gujarati: 'ચોકલેટી', roman: 'chokleti', english: 'Chocolate Brown', category: 'color', level: 3 },
  { gujarati: 'શીવાલી', roman: 'shivali', english: 'Indigo', category: 'color', level: 3 },
  { gujarati: 'માથુ', roman: 'maathu', english: 'Head', category: 'body', level: 1 },
  { gujarati: 'ગાલ', roman: 'gaal', english: 'Cheek', category: 'body', level: 1 },
  { gujarati: 'કપાલઅ', roman: 'kapaal', english: 'Forehead', category: 'body', level: 2 },
  { gujarati: 'ગલો', roman: 'galo', english: 'Throat', category: 'body', level: 2 },
  { gujarati: 'ખભો', roman: 'khabo', english: 'Shoulder', category: 'body', level: 2 },
  { gujarati: 'બાહુ', roman: 'baahu', english: 'Arm', category: 'body', level: 2 },
  { gujarati: 'કોણી', roman: 'koeni', english: 'Elbow', category: 'body', level: 3 },
  { gujarati: 'નાડી', roman: 'naadi', english: 'Wrist', category: 'body', level: 3 },
  { gujarati: 'આગલી', roman: 'aagali', english: 'Finger', category: 'body', level: 1 },
  { gujarati: 'અંગૂટો', roman: 'angutha', english: 'Thumb', category: 'body', level: 2 },
  { gujarati: 'છાતી', roman: 'chhati', english: 'Chest', category: 'body', level: 2 },
  { gujarati: 'પેટ', roman: 'pet', english: 'Stomach', category: 'body', level: 1 },
  { gujarati: 'પિથ', roman: 'pith', english: 'Back', category: 'body', level: 2 },
  { gujarati: 'ઘુટન', roman: 'ghutna', english: 'Knee', category: 'body', level: 2 },
  { gujarati: 'વાલ', roman: 'vaal', english: 'Hair', category: 'body', level: 1 },
  { gujarati: 'હોથ', roman: 'hoth', english: 'Lips', category: 'body', level: 1 },
  { gujarati: 'દાંત', roman: 'daant', english: 'Teeth', category: 'body', level: 1 },
  { gujarati: 'જીભ', roman: 'jibh', english: 'Tongue', category: 'body', level: 2 },
  { gujarati: 'ટોડી', roman: 'thodi', english: 'Chin', category: 'body', level: 2 },
  { gujarati: 'ભ્રુકટી', roman: 'bhrukuti', english: 'Eyebrow', category: 'body', level: 3 },
  { gujarati: 'હુદાય', roman: 'hudaya', english: 'Heart', category: 'body', level: 3 },
  { gujarati: 'દિમાગ', roman: 'dimaag', english: 'Brain', category: 'body', level: 3 },
  { gujarati: 'હથેલી', roman: 'hatheli', english: 'Palm', category: 'body', level: 2 },
  { gujarati: 'જાંગ', roman: 'jaangh', english: 'Thigh', category: 'body', level: 3 },
  { gujarati: 'એડી', roman: 'edhi', english: 'Heel', category: 'body', level: 3 },
  { gujarati: 'કાકા', roman: 'kaka', english: 'Paternal Uncle', category: 'family', level: 2 },
  { gujarati: 'કાકી', roman: 'kaki', english: 'Paternal Aunt', category: 'family', level: 2 },
  { gujarati: 'મામા', roman: 'mama', english: 'Maternal Uncle', category: 'family', level: 2 },
  { gujarati: 'મામી', roman: 'mami', english: 'Maternal Aunt', category: 'family', level: 2 },
  { gujarati: 'ફોઇ', roman: 'foi', english: "Father's Sister", category: 'family', level: 3 },
  { gujarati: 'નાના', roman: 'nana', english: 'Maternal Grandfather', category: 'family', level: 2 },
  { gujarati: 'નાની', roman: 'nani', english: 'Maternal Grandmother', category: 'family', level: 2 },
  { gujarati: 'દિકરો', roman: 'dikro', english: 'Son', category: 'family', level: 1 },
  { gujarati: 'દિકરી', roman: 'dikri', english: 'Daughter', category: 'family', level: 1 },
  { gujarati: 'પતિ', roman: 'pati', english: 'Husband', category: 'family', level: 2 },
  { gujarati: 'પત્ની', roman: 'patni', english: 'Wife', category: 'family', level: 2 },
  { gujarati: 'છોકરો', roman: 'chhokro', english: 'Boy', category: 'family', level: 1 },
  { gujarati: 'છોકરી', roman: 'chhokri', english: 'Girl', category: 'family', level: 1 },
  { gujarati: 'પાડોશી', roman: 'padoshi', english: 'Neighbor', category: 'family', level: 2 },
  { gujarati: 'શિક્સક', roman: 'shikshak', english: 'Teacher', category: 'family', level: 2 },
  { gujarati: 'ડોક્ટર', roman: 'daktar', english: 'Doctor', category: 'family', level: 1 },
  { gujarati: 'રાજા', roman: 'raja', english: 'King', category: 'family', level: 2 },
  { gujarati: 'રાણી', roman: 'rani', english: 'Queen', category: 'family', level: 2 },
  { gujarati: 'મોટો ભાઇ', roman: 'moto bhai', english: 'Elder Brother', category: 'family', level: 2 },
  { gujarati: 'મોટી બહેન', roman: 'moti bahen', english: 'Elder Sister', category: 'family', level: 2 },
  { gujarati: 'ભતીજો', roman: 'bhatijo', english: 'Nephew', category: 'family', level: 3 },
  { gujarati: 'ભતીજી', roman: 'bhatiji', english: 'Niece', category: 'family', level: 3 },
  { gujarati: 'પોતરો', roman: 'potro', english: 'Grandson', category: 'family', level: 3 },
  { gujarati: 'સાસુ', roman: 'saasu', english: 'Mother-in-law', category: 'family', level: 3 },
  { gujarati: 'સાસરો', roman: 'sasaro', english: 'Father-in-law', category: 'family', level: 3 },
  { gujarati: 'ઢોકલો', roman: 'dhoklo', english: 'Dhokla', category: 'food', level: 1 },
  { gujarati: 'થેપલા', roman: 'thepla', english: 'Thepla', category: 'food', level: 1 },
  { gujarati: 'ખિચડી', roman: 'khichdi', english: 'Khichdi', category: 'food', level: 1 },
  { gujarati: 'શાક', roman: 'shaak', english: 'Vegetable Curry', category: 'food', level: 1 },
  { gujarati: 'રોટલો', roman: 'rotlo', english: 'Millet Bread', category: 'food', level: 2 },
  { gujarati: 'છાશ', roman: 'chhash', english: 'Buttermilk', category: 'food', level: 1 },
  { gujarati: 'મિથાઇ', roman: 'mithai', english: 'Sweets', category: 'food', level: 1 },
  { gujarati: 'લડુ', roman: 'ladoo', english: 'Ladoo', category: 'food', level: 1 },
  { gujarati: 'હાલવો', roman: 'halvo', english: 'Halwa', category: 'food', level: 2 },
  { gujarati: 'પૂરી', roman: 'puri', english: 'Puri', category: 'food', level: 1 },
  { gujarati: 'ગાટિયા', roman: 'gathiya', english: 'Gathiya', category: 'food', level: 1 },
  { gujarati: 'સેવ', roman: 'sev', english: 'Sev', category: 'food', level: 1 },
  { gujarati: 'પાપડ', roman: 'papad', english: 'Papad', category: 'food', level: 2 },
  { gujarati: 'ખમન', roman: 'khaman', english: 'Khaman', category: 'food', level: 1 },
  { gujarati: 'ઉંધિયુ', roman: 'undhiyu', english: 'Undhiyu', category: 'food', level: 2 },
  { gujarati: 'ફાફડા', roman: 'fafda', english: 'Fafda', category: 'food', level: 1 },
  { gujarati: 'સાકર', roman: 'sakhar', english: 'Sugar', category: 'food', level: 1 },
  { gujarati: 'નમક', roman: 'namak', english: 'Salt', category: 'food', level: 1 },
  { gujarati: 'તેલ', roman: 'tel', english: 'Oil', category: 'food', level: 2 },
  { gujarati: 'જીરુ', roman: 'jeeru', english: 'Cumin', category: 'food', level: 2 },
  { gujarati: 'લસન', roman: 'lasan', english: 'Garlic', category: 'food', level: 2 },
  { gujarati: 'ડુંગલી', roman: 'dungli', english: 'Onion', category: 'food', level: 1 },
  { gujarati: 'તમેતા', roman: 'tameta', english: 'Tomato', category: 'food', level: 1 },
  { gujarati: 'બટાટા', roman: 'batata', english: 'Potato', category: 'food', level: 1 },
  { gujarati: 'મરચુ', roman: 'marchu', english: 'Chilli', category: 'food', level: 2 },
  { gujarati: 'આદુ', roman: 'aadu', english: 'Ginger', category: 'food', level: 2 },
  { gujarati: 'કોથમીર', roman: 'kothmir', english: 'Coriander', category: 'food', level: 2 },
  { gujarati: 'હલદર', roman: 'haldar', english: 'Turmeric', category: 'food', level: 2 },
  { gujarati: 'માખન', roman: 'makhan', english: 'Butter', category: 'food', level: 1 },
  { gujarati: 'મધ', roman: 'madh', english: 'Honey', category: 'food', level: 2 },
  { gujarati: 'અથાનુ', roman: 'athanu', english: 'Pickle', category: 'food', level: 2 },
  { gujarati: 'જ્યૂસ', roman: 'jyus', english: 'Juice', category: 'food', level: 1 },
  { gujarati: 'પવન', roman: 'pavan', english: 'Wind', category: 'nature', level: 1 },
  { gujarati: 'માટી', roman: 'maati', english: 'Soil', category: 'nature', level: 1 },
  { gujarati: 'ફૂલ', roman: 'phool', english: 'Flower', category: 'nature', level: 1 },
  { gujarati: 'પાં', roman: 'paan', english: 'Leaf', category: 'nature', level: 1 },
  { gujarati: 'વ્રુક્સ', roman: 'vruksh', english: 'Tree', category: 'nature', level: 2 },
  { gujarati: 'સમુદ્ર', roman: 'samudra', english: 'Ocean', category: 'nature', level: 2 },
  { gujarati: 'નદી', roman: 'nadi', english: 'River', category: 'nature', level: 1 },
  { gujarati: 'પહાડ', roman: 'pahad', english: 'Mountain', category: 'nature', level: 2 },
  { gujarati: 'જંગલ', roman: 'jangal', english: 'Forest', category: 'nature', level: 2 },
  { gujarati: 'રેતાલ', roman: 'retaal', english: 'Desert', category: 'nature', level: 3 },
  { gujarati: 'બરફ', roman: 'baraf', english: 'Snow', category: 'nature', level: 2 },
  { gujarati: 'વિજલી', roman: 'vijali', english: 'Lightning', category: 'nature', level: 2 },
  { gujarati: 'તુફાન', roman: 'tufaan', english: 'Storm', category: 'nature', level: 2 },
  { gujarati: 'બીજ', roman: 'beej', english: 'Seed', category: 'nature', level: 2 },
  { gujarati: 'શાખા', roman: 'shakha', english: 'Branch', category: 'nature', level: 2 },
  { gujarati: 'કમલ', roman: 'kamal', english: 'Lotus', category: 'nature', level: 2 },
  { gujarati: 'ગુલાબ', roman: 'gulab', english: 'Rose', category: 'nature', level: 1 },
  { gujarati: 'ચમેલી', roman: 'chameli', english: 'Jasmine', category: 'nature', level: 2 },
  { gujarati: 'ગેરુ ફૂલ', roman: 'geru phool', english: 'Marigold', category: 'nature', level: 2 },
  { gujarati: 'સૂરજમુખી', roman: 'surajmukhi', english: 'Sunflower', category: 'nature', level: 2 },
  { gujarati: 'ઇંદ્રધનુસ', roman: 'indradhanush', english: 'Rainbow', category: 'nature', level: 2 },
  { gujarati: 'તલાવ', roman: 'taalaav', english: 'Lake', category: 'nature', level: 2 },
  { gujarati: 'કૂવો', roman: 'kuvo', english: 'Well', category: 'nature', level: 2 },
  { gujarati: 'ધોડ', roman: 'dhod', english: 'Waterfall', category: 'nature', level: 2 },
  { gujarati: 'રેતો', roman: 'reto', english: 'Sand', category: 'nature', level: 1 },
  { gujarati: 'પથ્થર', roman: 'paththar', english: 'Rock', category: 'nature', level: 2 },
  { gujarati: 'ઘાસ', roman: 'ghaas', english: 'Grass', category: 'nature', level: 1 },
  { gujarati: 'ધુંધ', roman: 'dhundh', english: 'Fog', category: 'nature', level: 2 },
  { gujarati: 'ગુફા', roman: 'gupha', english: 'Cave', category: 'nature', level: 3 },
  { gujarati: 'ભૂકંપ', roman: 'bhookamp', english: 'Earthquake', category: 'nature', level: 3 },
  { gujarati: 'હીરો', roman: 'hiro', english: 'Diamond', category: 'surat', level: 1 },
  { gujarati: 'કાપડ', roman: 'kapad', english: 'Textile / Fabric', category: 'surat', level: 1 },
  { gujarati: 'લોચો', roman: 'locho', english: 'Locho (Surati snack)', category: 'surat', level: 1 },
  { gujarati: 'ઘુઘરા', roman: 'ghughra', english: 'Ghughra (sweet dumpling)', category: 'surat', level: 1 },
  { gujarati: 'તાપી', roman: 'tapi', english: 'Tapi River', category: 'surat', level: 1 },

  // Festivals
  { gujarati: 'પતંગ', roman: 'pataṅg', english: 'Kite', category: 'festival', level: 1 },
  { gujarati: 'દીવો', roman: 'dīvō', english: 'Lamp', category: 'festival', level: 1 },
  { gujarati: 'મીઠાઈ', roman: 'mīṭhāī', english: 'Sweets', category: 'festival', level: 1 },
  { gujarati: 'ગરબા', roman: 'garbā', english: 'Dance', category: 'festival', level: 2 },
  { gujarati: 'રંગ', roman: 'raṅg', english: 'Color', category: 'festival', level: 1 },
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

// ===== STORIES =====
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
    focusWords: [
      { gujarati: 'સિંહ', roman: 'sinh', english: 'lion' },
      { gujarati: 'ચૂહો', roman: 'choho', english: 'mouse' },
      { gujarati: 'મિત્ર', roman: 'mitr', english: 'friend' },
      { gujarati: 'મદદ', roman: 'madad', english: 'help' },
    ],
    moralGujarati: 'નાનો મિત્ર પણ મોટી મદદ કરી શકે.',
    moralEnglish: 'Even a small friend can give big help.',
    questionGujarati: 'ચૂહાએ સિંહને કેવી રીતે મદદ કરી?',
    questionEnglish: 'How did the mouse help the lion?',
  },

  {
    id: 'hungry-cat',
    titleGujarati: 'ભૂખી બિલાડી',
    titleEnglish: 'The Hungry Cat',
    level: 1,
    lines: [
      { gujarati: 'એક બિલાડી હતી.', roman: 'ek biladi hati.', english: 'There was a cat.' },
      { gujarati: 'બિલાડી ભૂખી હતી.', roman: 'biladi bhookhi hati.', english: 'The cat was hungry.' },
      { gujarati: 'તેણે માછલી શોધી.', roman: 'tene machhli shodhi.', english: 'She searched for fish.' },
      { gujarati: 'તેને એક મોટી માછલી મળી!', roman: 'tene ek moti machhli mali!', english: 'She found a big fish!' },
      { gujarati: 'બિલાડી ખુશ થઈ.', roman: 'biladi khush thi.', english: 'The cat became happy.' },
      { gujarati: 'તેણે માછલી ખાધી.', roman: 'tene machhli khaadhi.', english: 'She ate the fish.' },
      { gujarati: 'હવે બિલાડી તૃપ્ત છે!', roman: 'have biladi trupt chhe!', english: 'Now the cat is satisfied!' },
    ],
    focusWords: [
      { gujarati: 'બિલાડી', roman: 'biladi', english: 'cat' },
      { gujarati: 'ભૂખી', roman: 'bhookhi', english: 'hungry' },
      { gujarati: 'માછલી', roman: 'machhli', english: 'fish' },
      { gujarati: 'ખુશ', roman: 'khush', english: 'happy' },
    ],
    moralGujarati: 'જરૂરિયાત પૂરી થાય ત્યારે આનંદ મળે.',
    moralEnglish: 'Meeting a need brings joy.',
    questionGujarati: 'બિલાડીને શું મળ્યું?',
    questionEnglish: 'What did the cat find?',
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
    focusWords: [
      { gujarati: 'સૂરજ', roman: 'suraj', english: 'sun' },
      { gujarati: 'ચંદ્ર', roman: 'chandr', english: 'moon' },
      { gujarati: 'દિવસ', roman: 'divas', english: 'day' },
      { gujarati: 'રાત્રે', roman: 'raatre', english: 'at night' },
    ],
    moralGujarati: 'દરેકનું કામ અલગ છે, પણ બધું જરૂરી છે.',
    moralEnglish: 'Everyone has a different job, and each one matters.',
    questionGujarati: 'સૂરજ ક્યારે કામ કરે છે?',
    questionEnglish: 'When does the Sun work?',
  },

  {
    id: 'kite-wind',
    titleGujarati: 'પતંગ અને પવન',
    titleEnglish: 'The Kite and the Wind',
    level: 2,
    lines: [
      { gujarati: 'એક નાનો પતંગ હતો.', roman: 'ek nano patang hato.', english: 'There was a small kite.' },
      { gujarati: 'પતંગ આકાશમાં ઊડવા માગતો હતો.', roman: 'patang aakaashmaan udva maagto hato.', english: 'The kite wanted to fly in the sky.' },
      { gujarati: 'પવન ધીમો હતો.', roman: 'pavan dhimo hato.', english: 'The wind was gentle.' },
      { gujarati: 'બાળક બોલ્યું, "પવન, મદદ કર!"', roman: 'baalak bolyu, "pavan, madad kar!"', english: 'The child said, "Wind, help!"' },
      { gujarati: 'પવન હળવેથી ફૂંકાયો.', roman: 'pavan halavethi phunkayo.', english: 'The wind blew softly.' },
      { gujarati: 'પતંગ ઊંચે ઊડ્યો.', roman: 'patang unche udyo.', english: 'The kite flew high.' },
      { gujarati: 'બધા ખુશ થયા.', roman: 'badha khush thaya.', english: 'Everyone became happy.' },
      { gujarati: 'ધીમે ધીમે પણ સપનું પૂરું થાય.', roman: 'dhime dhime pan sapnu puru thay.', english: 'Slowly, a dream can come true.' },
    ],
    focusWords: [
      { gujarati: 'પતંગ', roman: 'patang', english: 'kite' },
      { gujarati: 'પવન', roman: 'pavan', english: 'wind' },
      { gujarati: 'આકાશ', roman: 'aakaash', english: 'sky' },
      { gujarati: 'ઊંચે', roman: 'unche', english: 'high' },
    ],
    moralGujarati: 'ધીમી મદદ પણ મોટી ઊંચાઈ આપે છે.',
    moralEnglish: 'Gentle help can lift us high.',
    questionGujarati: 'પતંગને કોણે મદદ કરી?',
    questionEnglish: 'Who helped the kite?',
  },

  {
    id: 'dadi-dhokla',
    titleGujarati: 'દાદીનો ઢોકળો',
    titleEnglish: "Grandmother's Dhokla",
    level: 2,
    lines: [
      { gujarati: 'દાદી રસોડામાં હતી.', roman: 'dadi rasodamaan hati.', english: 'Grandmother was in the kitchen.' },
      { gujarati: 'દાદી ઢોકળો બનાવતી હતી.', roman: 'dadi dhoklo banavti hati.', english: 'Grandmother was making dhokla.' },
      { gujarati: 'બાળકને ભૂખ લાગી હતી.', roman: 'baalakne bhookh laagi hati.', english: 'The child was hungry.' },
      { gujarati: 'દાદીએ કહ્યું, "થોડી રાહ જો."', roman: 'dadie kahyu, "thodi raah jo."', english: 'Grandmother said, "Wait a little."' },
      { gujarati: 'ઢોકળો પીળો અને નરમ હતો.', roman: 'dhoklo pilo ane naram hato.', english: 'The dhokla was yellow and soft.' },
      { gujarati: 'બાળકે ઢોકળો ખાધો.', roman: 'baalake dhoklo khaadho.', english: 'The child ate the dhokla.' },
      { gujarati: 'બાળકે કહ્યું, "આભાર, દાદી!"', roman: 'baalake kahyu, "aabhar, dadi!"', english: 'The child said, "Thank you, Grandmother!"' },
      { gujarati: 'દાદી હસી.', roman: 'dadi hasi.', english: 'Grandmother smiled.' },
      { gujarati: 'પ્રેમથી બનાવેલું ખાવાનું મીઠું લાગે.', roman: 'premthi banavelu khavanu mithu laage.', english: 'Food made with love tastes sweet.' },
    ],
    focusWords: [
      { gujarati: 'દાદી', roman: 'dadi', english: 'grandmother' },
      { gujarati: 'ઢોકળો', roman: 'dhoklo', english: 'dhokla' },
      { gujarati: 'રસોડું', roman: 'rasodu', english: 'kitchen' },
      { gujarati: 'આભાર', roman: 'aabhar', english: 'thank you' },
    ],
    moralGujarati: 'આભાર કહીએ ત્યારે પ્રેમ વધે છે.',
    moralEnglish: 'Gratitude makes love grow.',
    questionGujarati: 'દાદીએ શું બનાવ્યું?',
    questionEnglish: 'What did Grandmother make?',
  },

  {
    id: 'rainy-peacock',
    titleGujarati: 'વરસાદ અને મોર',
    titleEnglish: 'The Rain and the Peacock',
    level: 2,
    lines: [
      { gujarati: 'એક મોર બગીચામાં હતો.', roman: 'ek mor bagichamaan hato.', english: 'A peacock was in the garden.' },
      { gujarati: 'વાદળ આકાશમાં આવ્યા.', roman: 'vaadal aakaashmaan aavya.', english: 'Clouds came into the sky.' },
      { gujarati: 'વરસાદ શરૂ થયો.', roman: 'varsad sharu thayo.', english: 'The rain began.' },
      { gujarati: 'મોરે પાંખો ખોલી.', roman: 'more paankho kholi.', english: 'The peacock opened its feathers.' },
      { gujarati: 'મોર નાચ્યો.', roman: 'mor nachyo.', english: 'The peacock danced.' },
      { gujarati: 'બાળકોએ તાળી પાડી.', roman: 'baalakoe taali paadi.', english: 'The children clapped.' },
      { gujarati: 'વરસાદ પછી સૂરજ આવ્યો.', roman: 'varsad pachhi suraj aavyo.', english: 'After the rain, the Sun came.' },
      { gujarati: 'પ્રકૃતિ રંગોથી ભરાઈ ગઈ.', roman: 'prakruti rangothi bharai gai.', english: 'Nature filled with colors.' },
      { gujarati: 'વરસાદ પણ આનંદ લાવે છે.', roman: 'varsad pan aanand laave chhe.', english: 'Rain can also bring joy.' },
    ],
    focusWords: [
      { gujarati: 'મોર', roman: 'mor', english: 'peacock' },
      { gujarati: 'વરસાદ', roman: 'varsad', english: 'rain' },
      { gujarati: 'વાદળ', roman: 'vaadal', english: 'cloud' },
      { gujarati: 'નાચ્યો', roman: 'nachyo', english: 'danced' },
    ],
    moralGujarati: 'દરેક ઋતુમાં આનંદ શોધી શકાય.',
    moralEnglish: 'Joy can be found in every season.',
    questionGujarati: 'વરસાદમાં મોરે શું કર્યું?',
    questionEnglish: 'What did the peacock do in the rain?',
  },

  {
    id: 'thirsty-crow',
    titleGujarati: 'તરસ્યો કાગડો',
    titleEnglish: 'The Thirsty Crow',
    level: 1,
    lines: [
      { gujarati: 'ગરમીનો દિવસ હતો.', roman: 'garmi no divas hato.', english: 'It was a hot day.' },
      { gujarati: 'એક કાગડો તરસ્યો હતો.', roman: 'ek kagdo tarsyo hato.', english: 'A crow was thirsty.' },
      { gujarati: 'કાગડાએ પાણી શોધ્યું.', roman: 'kagdaae paani shodhyu.', english: 'The crow searched for water.' },
      { gujarati: 'તેને એક ઘડો મળ્યો.', roman: 'tene ek ghado malyo.', english: 'He found a pot.' },
      { gujarati: 'ઘડામાં પાણી ઓછું હતું.', roman: 'ghadaamaan paani ochhu hatu.', english: 'There was little water in the pot.' },
      { gujarati: 'કાગડાએ નાના પથ્થર નાખ્યા.', roman: 'kagdaae nana paththar nakhya.', english: 'The crow dropped small stones.' },
      { gujarati: 'પાણી ઉપર આવ્યું.', roman: 'paani upar aavyu.', english: 'The water came up.' },
      { gujarati: 'કાગડાએ પાણી પીધું.', roman: 'kagdaae paani pidhu.', english: 'The crow drank the water.' },
      { gujarati: 'બુદ્ધિથી મુશ્કેલી હલ થાય.', roman: 'buddhithi mushkeli hal thay.', english: 'Wisdom can solve a problem.' },
    ],
    focusWords: [
      { gujarati: 'કાગડો', roman: 'kagdo', english: 'crow' },
      { gujarati: 'તરસ્યો', roman: 'tarsyo', english: 'thirsty' },
      { gujarati: 'પાણી', roman: 'paani', english: 'water' },
      { gujarati: 'ઘડો', roman: 'ghado', english: 'pot' },
    ],
    moralGujarati: 'મુશ્કેલીમાં બુદ્ધિથી કામ લેવું.',
    moralEnglish: 'Use wisdom when a problem appears.',
    questionGujarati: 'કાગડાએ પાણી ઉપર લાવવા શું નાખ્યું?',
    questionEnglish: 'What did the crow drop to raise the water?',
  },

  {
    id: 'capseller-monkeys',
    titleGujarati: 'ટોપીવાળો અને વાંદરા',
    titleEnglish: 'The Cap Seller and the Monkeys',
    level: 2,
    lines: [
      { gujarati: 'એક ટોપીવાળો ગામ જઈ રહ્યો હતો.', roman: 'ek topivalo gaam jai rahyo hato.', english: 'A cap seller was going to a village.' },
      { gujarati: 'તેની ટોપલીમાં ઘણી ટોપીઓ હતી.', roman: 'teni toplimaan ghani topio hati.', english: 'There were many caps in his basket.' },
      { gujarati: 'તે ઝાડ નીચે સૂઈ ગયો.', roman: 'te jhad niche sui gayo.', english: 'He slept under a tree.' },
      { gujarati: 'વાંદરાઓએ ટોપીઓ લઈ લીધી.', roman: 'vandaraoe topio lai lidhi.', english: 'The monkeys took the caps.' },
      { gujarati: 'ટોપીવાળો જાગ્યો અને જોયું.', roman: 'topivalo jagyo ane joyu.', english: 'The cap seller woke up and looked.' },
      { gujarati: 'વાંદરા તેની નકલ કરતા હતા.', roman: 'vandara teni nakal karta hata.', english: 'The monkeys were copying him.' },
      { gujarati: 'તેણે પોતાની ટોપી નીચે ફેંકી.', roman: 'tene potani topi niche phenki.', english: 'He threw his own cap down.' },
      { gujarati: 'વાંદરાઓએ પણ ટોપીઓ ફેંકી.', roman: 'vandaraoe pan topio phenki.', english: 'The monkeys also threw the caps.' },
      { gujarati: 'ટોપીવાળાએ ટોપીઓ ઉઠાવી.', roman: 'topivalaae topio uthavi.', english: 'The cap seller picked up the caps.' },
      { gujarati: 'સમજથી કામ કરીએ તો રસ્તો મળે.', roman: 'samajthi kaam kariye to rasto male.', english: 'With understanding, we find a way.' },
    ],
    focusWords: [
      { gujarati: 'ટોપી', roman: 'topi', english: 'cap' },
      { gujarati: 'વાંદરા', roman: 'vandara', english: 'monkeys' },
      { gujarati: 'ઝાડ', roman: 'jhad', english: 'tree' },
      { gujarati: 'નકલ', roman: 'nakal', english: 'copying' },
    ],
    moralGujarati: 'ઘબરાશો નહીં; શાંતિથી વિચારશો.',
    moralEnglish: 'Do not panic; think calmly.',
    questionGujarati: 'ટોપીવાળાએ ટોપીઓ પાછી કેવી રીતે મેળવી?',
    questionEnglish: 'How did the cap seller get the caps back?',
  },

  {
    id: 'clever-rabbit-lion',
    titleGujarati: 'ચતુર સસલું અને સિંહ',
    titleEnglish: 'The Clever Rabbit and the Lion',
    level: 2,
    lines: [
      { gujarati: 'જંગલમાં એક સિંહ રહેતો હતો.', roman: 'jangalmaan ek sinh raheto hato.', english: 'A lion lived in the forest.' },
      { gujarati: 'સિંહ બધા પ્રાણીઓને ડરાવતો હતો.', roman: 'sinh badha pranione daravto hato.', english: 'The lion scared all the animals.' },
      { gujarati: 'એક દિવસ નાનું સસલું આવ્યું.', roman: 'ek divas nanu saslu aavyu.', english: 'One day, a small rabbit came.' },
      { gujarati: 'સસલાએ કહ્યું, "બીજો સિંહ કૂવામાં છે."', roman: 'saslaae kahyu, "bijo sinh kuvamaan chhe."', english: 'The rabbit said, "Another lion is in the well."' },
      { gujarati: 'સિંહ કૂવા પાસે ગયો.', roman: 'sinh kuva pase gayo.', english: 'The lion went near the well.' },
      { gujarati: 'તેણે પાણીમાં પોતાનું પ્રતિબિંબ જોયું.', roman: 'tene paanimaan potanu pratibimb joyu.', english: 'He saw his own reflection in the water.' },
      { gujarati: 'સિંહ ગુસ્સે થઈને કૂવામાં પડ્યો.', roman: 'sinh gusse thaine kuvamaan padyo.', english: 'The angry lion fell into the well.' },
      { gujarati: 'જંગલના પ્રાણીઓ બચી ગયા.', roman: 'jangalna pranio bachi gaya.', english: 'The forest animals were safe.' },
      { gujarati: 'બુદ્ધિ બળથી મોટી છે.', roman: 'buddhi balthi moti chhe.', english: 'Wisdom is greater than strength.' },
    ],
    focusWords: [
      { gujarati: 'સસલું', roman: 'saslu', english: 'rabbit' },
      { gujarati: 'સિંહ', roman: 'sinh', english: 'lion' },
      { gujarati: 'કૂવો', roman: 'kuvo', english: 'well' },
      { gujarati: 'બુદ્ધિ', roman: 'buddhi', english: 'wisdom' },
    ],
    moralGujarati: 'બુદ્ધિથી મોટું બળ મળે છે.',
    moralEnglish: 'Wisdom can be stronger than power.',
    questionGujarati: 'સસલાએ સિંહને ક્યાં લઈ ગયું?',
    questionEnglish: 'Where did the rabbit take the lion?',
  },

  {
    id: 'akbar-birbal-line',
    titleGujarati: 'અકબર અને બીરબલની રેખા',
    titleEnglish: "Akbar and Birbal's Line",
    level: 3,
    lines: [
      { gujarati: 'અકબરે જમીન પર એક રેખા દોરી.', roman: 'akbare jamin par ek rekha dori.', english: 'Akbar drew a line on the ground.' },
      { gujarati: 'અકબરે પૂછ્યું, "આ રેખાને અડ્યા વગર નાની કરો."', roman: 'akbare puchhyu, "aa rekhane adya vagar nani karo."', english: 'Akbar asked, "Make this line shorter without touching it."' },
      { gujarati: 'બધા દરબારીઓ વિચારતા રહ્યા.', roman: 'badha darbario vicharta rahya.', english: 'All the courtiers kept thinking.' },
      { gujarati: 'બીરબલ શાંત ઊભો રહ્યો.', roman: 'birbal shant ubho rahyo.', english: 'Birbal stood quietly.' },
      { gujarati: 'બીરબલે બાજુમાં મોટી રેખા દોરી.', roman: 'birbale bajumaan moti rekha dori.', english: 'Birbal drew a longer line beside it.' },
      { gujarati: 'જૂની રેખા હવે નાની લાગી.', roman: 'juni rekha have nani lagi.', english: 'The old line now looked shorter.' },
      { gujarati: 'અકબર હસ્યો અને ખુશ થયો.', roman: 'akbar hasyo ane khush thayo.', english: 'Akbar laughed and became happy.' },
      { gujarati: 'વિચાર બદલીએ તો જવાબ મળે.', roman: 'vichar badalie to jawab male.', english: 'When we change our thinking, we find an answer.' },
    ],
    focusWords: [
      { gujarati: 'અકબર', roman: 'akbar', english: 'Akbar' },
      { gujarati: 'બીરબલ', roman: 'birbal', english: 'Birbal' },
      { gujarati: 'રેખા', roman: 'rekha', english: 'line' },
      { gujarati: 'વિચાર', roman: 'vichar', english: 'thought' },
    ],
    moralGujarati: 'નવો વિચાર મુશ્કેલ પ્રશ્ન હલ કરે છે.',
    moralEnglish: 'A new way of thinking can solve a hard question.',
    questionGujarati: 'બીરબલે જૂની રેખાને અડ્યા વગર નાની કેવી રીતે કરી?',
    questionEnglish: 'How did Birbal make the old line shorter without touching it?',
  },

  {
    id: 'hare-tortoise',
    titleGujarati: 'સસલું અને કાચબો',
    titleEnglish: 'The Hare and the Tortoise',
    level: 1,
    lines: [
      { gujarati: 'સસલું ઝડપી હતું અને કાચબો ધીમો હતો.', roman: 'saslu jadapi hatu ane kachbo dhimo hato.', english: 'The hare was fast, and the tortoise was slow.' },
      { gujarati: 'બન્નેએ દોડની શરત લગાવી.', roman: 'banne e dodni sharat lagavi.', english: 'They had a race.' },
      { gujarati: 'સસલું આગળ ગયું અને સૂઈ ગયું.', roman: 'saslu aagal gayu ane sui gayu.', english: 'The hare went ahead and slept.' },
      { gujarati: 'કાચબો ધીમે ધીમે ચાલતો રહ્યો.', roman: 'kachbo dhime dhime chaalto rahyo.', english: 'The tortoise kept walking slowly.' },
      { gujarati: 'કાચબો જીત્યો કારણ કે તે અટક્યો નહીં.', roman: 'kachbo jityo karan ke te atakyo nahi.', english: 'The tortoise won because he did not stop.' },
    ],
    moralGujarati: 'ધીમે અને સતત કામ કરવાથી જીત મળે છે.',
    moralEnglish: 'Slow and steady wins the race.',
  },

  {
    id: 'monkey-crocodile',
    titleGujarati: 'વાંદરો અને મગર',
    titleEnglish: 'The Monkey and the Crocodile',
    level: 2,
    lines: [
      { gujarati: 'વાંદરો ઝાડ પર રહેતો હતો.', roman: 'vandro jhad par raheto hato.', english: 'A monkey lived on a tree.' },
      { gujarati: 'તે મગરને મીઠા ફળ આપતો હતો.', roman: 'te magarne mitha fal aapto hato.', english: 'He gave sweet fruit to a crocodile.' },
      { gujarati: 'મગરે વાંદરાને પાણીમાં લઈ જવાનું વિચાર્યું.', roman: 'magare vandarane paanimaa lai javanu vicharyu.', english: 'The crocodile planned to take the monkey into the water.' },
      { gujarati: 'વાંદરાએ કહ્યું, "મારું હૃદય તો ઝાડ પર છે."', roman: 'vandaraye kahyu, "maru hruday to jhad par chhe."', english: 'The monkey said, "My heart is still on the tree."' },
      { gujarati: 'મગર પાછો ફર્યો અને વાંદરો છટકી ગયો.', roman: 'magar pachho faryo ane vandro chhataki gayo.', english: 'The crocodile turned back, and the monkey escaped.' },
    ],
    moralGujarati: 'ઝડપી વિચાર તમને બચાવી શકે છે.',
    moralEnglish: 'Quick thinking can save you.',
  },

  {
    id: 'ant-grasshopper',
    titleGujarati: 'કીડી અને તીડ',
    titleEnglish: 'The Ant and the Grasshopper',
    level: 2,
    lines: [
      { gujarati: 'ઉનાળામાં કીડી દાણા ભેગા કરતી હતી.', roman: 'unalama kidi daana bhega karti hati.', english: 'In summer, the ant gathered grains.' },
      { gujarati: 'તીડ ગીત ગાતો અને રમતો હતો.', roman: 'tid geet gato ane ramto hato.', english: 'The grasshopper sang and played.' },
      { gujarati: 'શિયાળો આવ્યો અને ખોરાક ઓછો થયો.', roman: 'shiyalo aavyo ane khorak ocho thayo.', english: 'Winter came, and food became scarce.' },
      { gujarati: 'કીડી પાસે ખોરાક હતો.', roman: 'kidi pase khorak hato.', english: 'The ant had food.' },
      { gujarati: 'તીડને સમજાયું કે તૈયારી જરૂરી છે.', roman: 'tidne samajayu ke taiyari jaruri chhe.', english: 'The grasshopper learned that preparation matters.' },
    ],
    moralGujarati: 'આજે તૈયારી કરો તો આવતીકાલ સરળ બને.',
    moralEnglish: 'Prepare today for tomorrow.',
  },

  {
    id: 'golden-eggs-goose',
    titleGujarati: 'સોનાના ઈંડા આપતી હંસ',
    titleEnglish: 'The Goose with Golden Eggs',
    level: 2,
    lines: [
      { gujarati: 'એક ખેડૂત પાસે ખાસ હંસ હતી.', roman: 'ek khedut pase khas hans hati.', english: 'A farmer had a special goose.' },
      { gujarati: 'હંસ દરરોજ સોનાનું ઈંડું આપતી.', roman: 'hans darroj sonanu indu aapti.', english: 'The goose laid one golden egg every day.' },
      { gujarati: 'ખેડૂત વધુ સોનું તરત મેળવવા માંગતો હતો.', roman: 'khedut vadhu sonu tarat melava mangto hato.', english: 'The farmer wanted more gold at once.' },
      { gujarati: 'લાલચમાં તેણે હંસને નુકસાન કર્યું.', roman: 'lalachmaa tene hansne nuksan karyu.', english: 'In greed, he harmed the goose.' },
      { gujarati: 'હવે તેને એક પણ સોનાનું ઈંડું મળ્યું નહીં.', roman: 'have tene ek pan sonanu indu malyu nahi.', english: 'After that, he got no golden eggs.' },
    ],
    moralGujarati: 'લાલચ સારા ભાગ્યને નષ્ટ કરે છે.',
    moralEnglish: 'Greed destroys good fortune.',
  },

  {
    id: 'bundle-sticks',
    titleGujarati: 'લાકડીઓનો ગઠ્ઠો',
    titleEnglish: 'The Bundle of Sticks',
    level: 2,
    lines: [
      { gujarati: 'એક પિતાના દીકરાઓ હંમેશા ઝઘડતા હતા.', roman: 'ek pitana dikara hamesha jhagdta hata.', english: 'A father’s sons always fought.' },
      { gujarati: 'પિતાએ એક લાકડી તોડવા આપી.', roman: 'pitae ek lakdi todva aapi.', english: 'The father gave them one stick to break.' },
      { gujarati: 'એક લાકડી સરળતાથી તૂટી ગઈ.', roman: 'ek lakdi saraltathi tuti gai.', english: 'One stick broke easily.' },
      { gujarati: 'પછી પિતાએ લાકડીઓનો ગઠ્ઠો આપ્યો.', roman: 'pachhi pitae lakdiyo no gattho aapyo.', english: 'Then he gave them a bundle of sticks.' },
      { gujarati: 'ગઠ્ઠો કોઈ તોડી શક્યું નહીં.', roman: 'gattho koi todi shakyu nahi.', english: 'No one could break the bundle.' },
    ],
    moralGujarati: 'એકતા માં શક્તિ છે.',
    moralEnglish: 'Unity is strength.',
  },

  {
    id: 'honest-woodcutter',
    titleGujarati: 'ઈમાનદાર લાકડકાટો',
    titleEnglish: 'The Honest Woodcutter',
    level: 2,
    lines: [
      { gujarati: 'લાકડકાટોની કુહાડી નદીમાં પડી ગઈ.', roman: 'lakadkatoni kuhadi nadimaa padi gai.', english: 'A woodcutter’s axe fell into the river.' },
      { gujarati: 'જળ દેવતાએ સોનાની કુહાડી બતાવી.', roman: 'jal devatae sonani kuhadi batavi.', english: 'The river spirit showed him a golden axe.' },
      { gujarati: 'લાકડકાટોએ કહ્યું, "આ મારી નથી."', roman: 'lakadkatoe kahyu, "aa mari nathi."', english: 'The woodcutter said, "This is not mine."' },
      { gujarati: 'તેણે પોતાની જૂની કુહાડી પસંદ કરી.', roman: 'tene potani juni kuhadi pasand kari.', english: 'He chose his own old axe.' },
      { gujarati: 'તેની ઈમાનદારી માટે તેને ઇનામ મળ્યું.', roman: 'teni imandari mate tene inaam malyu.', english: 'He was rewarded for his honesty.' },
    ],
    moralGujarati: 'ઈમાનદારીનું ઇનામ મળે છે.',
    moralEnglish: 'Honesty is rewarded.',
  },

  {
    id: 'boy-cried-wolf',
    titleGujarati: 'જૂઠ બોલનાર છોકરો',
    titleEnglish: 'The Boy Who Cried Wolf',
    level: 2,
    lines: [
      { gujarati: 'એક છોકરો ભેંસો ચરાવતો હતો.', roman: 'ek chokro bhenso charavto hato.', english: 'A boy watched the herd.' },
      { gujarati: 'તે મજાકમાં બોલ્યો, "વરુ આવ્યું!"', roman: 'te majakmaa bolyo, "varu aavyu!"', english: 'As a joke he shouted, "Wolf!"' },
      { gujarati: 'ગામવાળા દોડી આવ્યા, પણ વરુ નહોતું.', roman: 'gaamvala dodi aavya, pan varu nahotu.', english: 'The villagers ran over, but there was no wolf.' },
      { gujarati: 'એક દિવસ સાચું વરુ આવ્યું.', roman: 'ek divas sachu varu aavyu.', english: 'One day a real wolf came.' },
      { gujarati: 'કોઈએ છોકરાની વાત પર વિશ્વાસ કર્યો નહીં.', roman: 'koie chokrani vaat par vishvas karyo nahi.', english: 'No one believed the boy.' },
    ],
    moralGujarati: 'જૂઠ બોલવાથી વિશ્વાસ તૂટી જાય છે.',
    moralEnglish: 'Lying destroys trust.',
  },

  {
    id: 'fox-grapes',
    titleGujarati: 'શિયાળ અને દ્રાક્ષ',
    titleEnglish: 'The Fox and the Grapes',
    level: 1,
    lines: [
      { gujarati: 'એક શિયાળે ઊંચે દ્રાક્ષ જોઈ.', roman: 'ek shiyale unche draksh joi.', english: 'A fox saw grapes high above.' },
      { gujarati: 'તે દ્રાક્ષ લેવા કૂદ્યો.', roman: 'te draksh leva kudyo.', english: 'He jumped to get the grapes.' },
      { gujarati: 'દ્રાક્ષ તેની પહોંચથી દૂર હતી.', roman: 'draksh teni pahochthi dur hati.', english: 'The grapes were out of his reach.' },
      { gujarati: 'શિયાળ બોલ્યો, "દ્રાક્ષ તો ખાટી છે."', roman: 'shiyal bolyo, "draksh to khati chhe."', english: 'The fox said, "The grapes are sour."' },
      { gujarati: 'તે ખાલી હાથ ચાલી ગયો.', roman: 'te khali haath chali gayo.', english: 'He walked away empty-handed.' },
    ],
    moralGujarati: 'જે ન મળે તેનું અપમાન ન કરવું.',
    moralEnglish: 'Don’t insult what you cannot get.',
  },

  {
    id: 'blue-jackal',
    titleGujarati: 'વાદળી શિયાળ',
    titleEnglish: 'The Blue Jackal',
    level: 3,
    lines: [
      { gujarati: 'એક શિયાળ વાદળી રંગમાં પડી ગયો.', roman: 'ek shiyal vadali rangmaa padi gayo.', english: 'A jackal fell into blue dye.' },
      { gujarati: 'જંગલના પ્રાણીઓ તેને અજાણ્યો રાજા માન્યા.', roman: 'jangalna pranio tene ajanyo raja manya.', english: 'The animals thought he was a strange king.' },
      { gujarati: 'શિયાળે રાજા બનવાનો ઢોંગ કર્યો.', roman: 'shiyale raja banvano dhong karyo.', english: 'The jackal pretended to be king.' },
      { gujarati: 'એક રાત્રે તે શિયાળની જેમ રડ્યો.', roman: 'ek ratre te shiyalni jem radyo.', english: 'One night he howled like a jackal.' },
      { gujarati: 'બધાને સત્ય ખબર પડી ગયું.', roman: 'badhane satya khabar padi gayu.', english: 'Everyone learned the truth.' },
    ],
    moralGujarati: 'ઢોંગ લાંબો સમય ચાલતો નથી.',
    moralEnglish: 'Pretending does not last forever.',
  },

  {
    id: 'two-cats-monkey',
    titleGujarati: 'બે બિલાડી અને વાંદરો',
    titleEnglish: 'Two Cats and the Monkey',
    level: 2,
    lines: [
      { gujarati: 'બે બિલાડીઓને રોટલી મળી.', roman: 'be billadio ne rotli mali.', english: 'Two cats found a piece of bread.' },
      { gujarati: 'બન્ને રોટલી માટે ઝઘડવા લાગી.', roman: 'banne rotli mate jhagdva lagi.', english: 'Both began fighting over it.' },
      { gujarati: 'વાંદરાએ કહ્યું, "હું ન્યાય કરીશ."', roman: 'vandaraye kahyu, "hu nyay karish."', english: 'A monkey said, "I will judge fairly."' },
      { gujarati: 'તે દરેક ભાગમાંથી થોડું થોડું ખાતો ગયો.', roman: 'te darek bhagmathi thodu thodu khato gayo.', english: 'He kept eating a little from each piece.' },
      { gujarati: 'અંતે બિલાડીઓ પાસે કશું રહ્યું નહીં.', roman: 'ante billadio pase kashu rahyu nahi.', english: 'In the end, the cats had nothing left.' },
    ],
    moralGujarati: 'ઝઘડવાથી બીજા લોકો ફાયદો ઉઠાવે છે.',
    moralEnglish: 'Fighting lets others take advantage.',
  },

  {
    id: 'pigeons-hunters-net',
    titleGujarati: 'કબૂતર અને જાળ',
    titleEnglish: 'The Pigeons and the Hunter’s Net',
    level: 2,
    lines: [
      { gujarati: 'કબૂતરો દાણા ખાવા જમીન પર આવ્યા.', roman: 'kabutaro daana khava jamin par aavya.', english: 'Pigeons came down to eat grains.' },
      { gujarati: 'શિકારીએ જાળ પાથરી હતી.', roman: 'shikariye jaal pathari hati.', english: 'A hunter had spread a net.' },
      { gujarati: 'બધા કબૂતરો જાળમાં ફસાયા.', roman: 'badha kabutaro jaalmaa fasaya.', english: 'All the pigeons were trapped.' },
      { gujarati: 'રાજા કબૂતરે કહ્યું, "બધા સાથે ઉડો."', roman: 'raja kabutare kahyu, "badha sathe udo."', english: 'The pigeon king said, "Fly together."' },
      { gujarati: 'બધાએ સાથે ઉડીને જાળ લઈ ગયા.', roman: 'badhae sathe udine jaal lai gaya.', english: 'Together they flew away carrying the net.' },
    ],
    moralGujarati: 'ટીમવર્કથી બધાને બચાવી શકાય છે.',
    moralEnglish: 'Teamwork can save everyone.',
  },

  {
    id: 'crow-snake',
    titleGujarati: 'કાગડો અને સાપ',
    titleEnglish: 'The Crow and the Snake',
    level: 3,
    lines: [
      { gujarati: 'કાગડાનું માળું ઝાડ પર હતું.', roman: 'kagdanu malu jhad par hatu.', english: 'A crow’s nest was in a tree.' },
      { gujarati: 'સાપ વારંવાર તેના ઈંડા ખાઈ જતો હતો.', roman: 'saap varamvar tena inda khai jato hato.', english: 'A snake kept eating the eggs.' },
      { gujarati: 'કાગડાએ રાણીનો હાર ઉઠાવ્યો.', roman: 'kagdaae rani no haar uthavyo.', english: 'The crow picked up the queen’s necklace.' },
      { gujarati: 'તે હાર સાપના બિલ પાસે મૂક્યો.', roman: 'te haar saapna bil pase mukyo.', english: 'He dropped it near the snake’s hole.' },
      { gujarati: 'રક્ષકોએ સાપને દૂર કર્યો.', roman: 'rakshakoe saapne dur karyo.', english: 'The guards drove the snake away.' },
    ],
    moralGujarati: 'ચતુર યોજના જોખમને હરાવી શકે છે.',
    moralEnglish: 'Clever planning can defeat danger.',
  },

  {
    id: 'crane-crab',
    titleGujarati: 'બગલો અને કરચલો',
    titleEnglish: 'The Crane and the Crab',
    level: 3,
    lines: [
      { gujarati: 'બગલાએ માછલીઓને ખોટું કહ્યું.', roman: 'baglaae machhalio ne khotu kahyu.', english: 'A crane lied to the fish.' },
      { gujarati: 'તે બોલ્યો, "હું તમને સુરક્ષિત તળાવમાં લઈ જઈશ."', roman: 'te bolyo, "hu tamne surakshit talavmaa lai jaish."', english: 'He said, "I will take you to a safe pond."' },
      { gujarati: 'હકીકતમાં તે માછલીઓને ખાઈ જતો હતો.', roman: 'hakikatmaa te machhalio ne khai jato hato.', english: 'In truth, he was eating the fish.' },
      { gujarati: 'કરચલાએ હાડકાં જોઈ લીધાં.', roman: 'karchalaae hadka joi lidha.', english: 'The crab saw the bones.' },
      { gujarati: 'કરચલાએ બગલાની ખોટ પકડી.', roman: 'karchalaae baglani khot pakdi.', english: 'The crab exposed the crane’s lie.' },
    ],
    moralGujarati: 'ખોટ એક દિવસ ખુલ્લી પડે છે.',
    moralEnglish: 'Lies eventually get exposed.',
  },

  {
    id: 'farmer-snake',
    titleGujarati: 'ખેડૂત અને સાપ',
    titleEnglish: 'The Farmer and the Snake',
    level: 2,
    lines: [
      { gujarati: 'ખેડૂતે ઠંડીમાં સાપ જોયો.', roman: 'khedute thandimaa saap joyo.', english: 'A farmer saw a snake in the cold.' },
      { gujarati: 'દયા કરીને તેણે સાપને ગરમ કર્યો.', roman: 'daya karine tene saapne garam karyo.', english: 'Out of kindness, he warmed the snake.' },
      { gujarati: 'સાપ જીવતો થયો.', roman: 'saap jivto thayo.', english: 'The snake came back to life.' },
      { gujarati: 'પણ સાપે ખેડૂતને ડંખ માર્યો.', roman: 'pan saape khedutne dankh maryo.', english: 'But the snake bit the farmer.' },
      { gujarati: 'ખેડૂતને સમજાયું કે વિશ્વાસ સમજદારીથી કરવો.', roman: 'khedutne samajayu ke vishvas samajdarithi karvo.', english: 'The farmer learned to trust carefully.' },
    ],
    moralGujarati: 'કોણ પર વિશ્વાસ કરવો તે વિચારવું જોઈએ.',
    moralEnglish: 'Be careful whom you trust.',
  },

  {
    id: 'greedy-dog',
    titleGujarati: 'લાલચી કૂતરો',
    titleEnglish: 'The Greedy Dog',
    level: 1,
    lines: [
      { gujarati: 'કૂતરાના મોઢામાં રોટલી હતી.', roman: 'kutrana modhamaa rotli hati.', english: 'A dog had bread in his mouth.' },
      { gujarati: 'તે પુલ પરથી પસાર થતો હતો.', roman: 'te pul parthi pasar thato hato.', english: 'He was crossing a bridge.' },
      { gujarati: 'પાણીમાં તેને પોતાનું પ્રતિબિંબ દેખાયું.', roman: 'paanimaa tene potanu pratibimb dekhayu.', english: 'He saw his reflection in the water.' },
      { gujarati: 'તે બીજી રોટલી સમજીને ભસ્યો.', roman: 'te biji rotli samjine bhasyo.', english: 'He barked, thinking it was another piece of bread.' },
      { gujarati: 'તેની પોતાની રોટલી પાણીમાં પડી ગઈ.', roman: 'teni potani rotli paanimaa padi gai.', english: 'His own bread fell into the water.' },
    ],
    moralGujarati: 'લાલચથી જે છે તે પણ ગુમાવી શકાય.',
    moralEnglish: 'Greed can make you lose what you already have.',
  },

  {
    id: 'donkey-lion-skin',
    titleGujarati: 'સિંહની ચામડીમાં ગધેડો',
    titleEnglish: 'The Donkey in the Lion’s Skin',
    level: 2,
    lines: [
      { gujarati: 'ગધેડાને સિંહની ચામડી મળી.', roman: 'gadhedane sinhni chamdi mali.', english: 'A donkey found a lion’s skin.' },
      { gujarati: 'તે ચામડી પહેરીને જંગલમાં ગયો.', roman: 'te chamdi paherine jangalmaa gayo.', english: 'He wore it and went into the forest.' },
      { gujarati: 'પ્રાણીઓ તેને સિંહ સમજીને ડર્યા.', roman: 'pranio tene sinh samjine darya.', english: 'The animals feared him like a lion.' },
      { gujarati: 'ગધેડો ખુશ થઈને રેંકવા લાગ્યો.', roman: 'gadhedo khush thaine renkva lagyo.', english: 'The donkey became happy and brayed.' },
      { gujarati: 'બધાને ખબર પડી કે તે ગધેડો છે.', roman: 'badhane khabar padi ke te gadhedo chhe.', english: 'Everyone realized he was a donkey.' },
    ],
    moralGujarati: 'મહાન દેખાવાથી મહાન બનાતું નથી.',
    moralEnglish: 'Pretending to be great does not make you great.',
  },

  {
    id: 'salt-merchant-donkey',
    titleGujarati: 'મીઠું વેપારી અને ગધેડો',
    titleEnglish: 'The Salt Merchant and the Donkey',
    level: 2,
    lines: [
      { gujarati: 'વેપારી ગધેડા પર મીઠું લાદતો હતો.', roman: 'vepari gadheda par mithu laadto hato.', english: 'A merchant loaded salt on a donkey.' },
      { gujarati: 'ગધેડો પાણીમાં પડી ગયો.', roman: 'gadhedo paanimaa padi gayo.', english: 'The donkey fell into water.' },
      { gujarati: 'મીઠું ઓગળ્યું અને ભાર હળવો થયો.', roman: 'mithu ogalyu ane bhaar halvo thayo.', english: 'The salt dissolved, and the load became light.' },
      { gujarati: 'ગધેડો ફરીથી એવું જ કરવા લાગ્યો.', roman: 'gadhedo farithi evu j karva lagyo.', english: 'The donkey tried the same trick again.' },
      { gujarati: 'વેપારીએ કપાસ લાદ્યો, અને પાણીમાં ભાર વધી ગયો.', roman: 'veparie kapas laadyo, ane paanimaa bhaar vadhi gayo.', english: 'The merchant loaded cotton, and in water it became heavier.' },
    ],
    moralGujarati: 'યુક્તિ ક્યારેક પાછી પડે છે.',
    moralEnglish: 'Tricks can backfire.',
  },

  {
    id: 'milkmaid-dream',
    titleGujarati: 'દૂધવાળીનું સપનું',
    titleEnglish: 'The Milkmaid and Her Dream',
    level: 2,
    lines: [
      { gujarati: 'દૂધવાળી માથા પર દૂધનો ઘડો લઈ જતી હતી.', roman: 'doodhwali matha par doodhno ghado lai jati hati.', english: 'A milkmaid carried a pot of milk on her head.' },
      { gujarati: 'તે સપના જોવા લાગી.', roman: 'te sapna jova lagi.', english: 'She began to dream.' },
      { gujarati: 'તે વિચારી, "દૂધ વેચીશ અને મરઘીઓ ખરીદીશ."', roman: 'te vichari, "doodh vechish ane marghio kharidish."', english: 'She thought, "I will sell milk and buy hens."' },
      { gujarati: 'સપનામાં તેણે માથું હલાવ્યું.', roman: 'sapnamaa tene mathu halavyu.', english: 'In her dream, she shook her head.' },
      { gujarati: 'ઘડો તૂટી ગયો અને દૂધ વહી ગયું.', roman: 'ghado tuti gayo ane doodh vahi gayu.', english: 'The pot broke, and the milk spilled.' },
    ],
    moralGujarati: 'કામ થાય તે પહેલાં સફળતા ન ગણવી.',
    moralEnglish: 'Don’t count success before it happens.',
  },

  {
    id: 'farmers-lazy-sons',
    titleGujarati: 'ખેડૂતના આળસુ દીકરા',
    titleEnglish: 'The Farmer’s Lazy Sons',
    level: 2,
    lines: [
      { gujarati: 'ખેડૂતના દીકરાઓ આળસુ હતા.', roman: 'khedutna dikara aalsu hata.', english: 'A farmer’s sons were lazy.' },
      { gujarati: 'ખેડૂતે કહ્યું, "ખેતરમાં ખજાનો છે."', roman: 'khedute kahyu, "khetarmaa khajano chhe."', english: 'The farmer said, "There is treasure in the field."' },
      { gujarati: 'દીકરાઓએ આખું ખેતર ખોદ્યું.', roman: 'dikaraoe aakhu khetar khodyu.', english: 'The sons dug the whole field.' },
      { gujarati: 'ખજાનો મળ્યો નહીં, પણ જમીન તૈયાર થઈ.', roman: 'khajano malyo nahi, pan jamin taiyar thai.', english: 'They found no treasure, but the soil was ready.' },
      { gujarati: 'પાક સારો આવ્યો અને દીકરાઓને સત્ય સમજાયું.', roman: 'paak saro aavyo ane dikaraone satya samajayu.', english: 'The crop grew well, and the sons understood the truth.' },
    ],
    moralGujarati: 'મહેનત જ સાચો ખજાનો છે.',
    moralEnglish: 'Hard work is the real treasure.',
  },

  {
    id: 'sun-wind',
    titleGujarati: 'સૂરજ અને પવન',
    titleEnglish: 'The Sun and the Wind',
    level: 1,
    lines: [
      { gujarati: 'સૂરજ અને પવન વચ્ચે વાત થઈ.', roman: 'suraj ane pavan vachche vaat thai.', english: 'The sun and the wind had a talk.' },
      { gujarati: 'તેમણે મુસાફરની ચાદર ઉતારવાની શરત લગાવી.', roman: 'temne musafarni chadar utarvani sharat lagavi.', english: 'They tried to make a traveler remove his cloak.' },
      { gujarati: 'પવન જોરથી ફૂંકાયો, પણ મુસાફરે ચાદર પકડી રાખી.', roman: 'pavan jorthi funkayo, pan musafare chadar pakdi rakhi.', english: 'The wind blew hard, but the traveler held the cloak.' },
      { gujarati: 'સૂરજે નરમ ગરમી આપી.', roman: 'suraje naram garmi aapi.', english: 'The sun gave gentle warmth.' },
      { gujarati: 'મુસાફરે ચાદર પોતે ઉતારી.', roman: 'musafare chadar pote utari.', english: 'The traveler removed the cloak himself.' },
    ],
    moralGujarati: 'બળ કરતા દયા વધુ સારું કામ કરે છે.',
    moralEnglish: 'Kindness works better than force.',
  },

  {
    id: 'wise-old-bird',
    titleGujarati: 'સમજદાર પક્ષી',
    titleEnglish: 'The Wise Old Bird',
    level: 2,
    lines: [
      { gujarati: 'જૂના પક્ષીએ નવું વેલ વધતું જોયું.', roman: 'juna pakshiye navu vel vadhatu joyu.', english: 'An old bird saw a new vine growing.' },
      { gujarati: 'તે બોલ્યું, "આ વેલ જોખમ બની શકે છે."', roman: 'te bolyu, "aa vel jokham bani shake chhe."', english: 'It said, "This vine can become dangerous."' },
      { gujarati: 'નાના પક્ષીઓએ સલાહ સાંભળી નહીં.', roman: 'nana pakshioe salah sambhli nahi.', english: 'The young birds did not listen.' },
      { gujarati: 'શિકારી વેલ પર ચડીને માળાં સુધી પહોંચ્યો.', roman: 'shikari vel par chadine mala sudhi pahochyo.', english: 'A hunter climbed the vine and reached the nests.' },
      { gujarati: 'પક્ષીઓને મોડું સમજાયું કે સારી સલાહ વહેલી સાંભળવી.', roman: 'pakshione modu samajayu ke sari salah vaheli sambhalvi.', english: 'The birds learned to listen to good advice early.' },
    ],
    moralGujarati: 'સારી સલાહ વહેલી સાંભળો.',
    moralEnglish: 'Listen to good advice early.',
  },

  {
    id: 'elephant-tailor',
    titleGujarati: 'હાથી અને દરજી',
    titleEnglish: 'The Elephant and the Tailor',
    level: 2,
    lines: [
      { gujarati: 'હાથી દરરોજ દરજીની દુકાન પાસે આવતો.', roman: 'hathi darroj darjini dukan pase aavto.', english: 'An elephant came by the tailor’s shop every day.' },
      { gujarati: 'દરજી તેને ફળ આપતો હતો.', roman: 'darji tene fal aapto hato.', english: 'The tailor gave him fruit.' },
      { gujarati: 'એક દિવસ દરજીએ હાથીને સોય ચૂભાડી.', roman: 'ek divas darjie hathine soy chubhadi.', english: 'One day the tailor pricked the elephant with a needle.' },
      { gujarati: 'હાથી દુઃખી થયો અને પાણી લઈને આવ્યો.', roman: 'hathi dukkhi thayo ane paani laine aavyo.', english: 'The elephant was hurt and brought water.' },
      { gujarati: 'તેણે દુકાનમાં પાણી છાંટ્યું અને દરજીને પાઠ મળ્યો.', roman: 'tene dukanmaa paani chhantyu ane darjine path malyo.', english: 'He sprayed the shop, and the tailor learned a lesson.' },
    ],
    moralGujarati: 'જે વિશ્વાસ કરે તેને દુઃખ ન આપવું.',
    moralEnglish: 'Do not hurt those who trust you.',
  },

  {
    id: 'talking-cave',
    titleGujarati: 'બોલતી ગુફા',
    titleEnglish: 'The Talking Cave',
    level: 3,
    lines: [
      { gujarati: 'સિંહ ગુફામાં છુપાયો હતો.', roman: 'sinh gufamaa chhupayo hato.', english: 'A lion hid inside a cave.' },
      { gujarati: 'શિયાળ ઘરે પાછો આવ્યો અને પગલાં જોયાં.', roman: 'shiyal ghare pachho aavyo ane pagla joya.', english: 'A fox returned home and saw footprints.' },
      { gujarati: 'પગલાં અંદર જતા હતા, બહાર આવતા નહોતા.', roman: 'pagla andar jata hata, bahar aavta nahota.', english: 'The footprints went in, but did not come out.' },
      { gujarati: 'શિયાળે ગુફાને બોલાવી, "ઓ ગુફા, મને જવાબ આપ."', roman: 'shiyale gufane bolavi, "o gufa, mane jawab aap."', english: 'The fox called, "O cave, answer me."' },
      { gujarati: 'સિંહ બોલી પડ્યો અને શિયાળ ભાગી ગયો.', roman: 'sinh boli padyo ane shiyal bhagi gayo.', english: 'The lion spoke, and the fox ran away.' },
    ],
    moralGujarati: 'જોખમમાં પ્રવેશતા પહેલાં વિચારો.',
    moralEnglish: 'Think before entering danger.',
  },

  {
    id: 'akbar-birbal-crows',
    titleGujarati: 'અકબર-બીરબલ: કાગડાની ગણતરી',
    titleEnglish: 'Akbar and Birbal’s Crows',
    level: 3,
    lines: [
      { gujarati: 'અકબરે બીરબલને પૂછ્યું, "શહેરમાં કેટલા કાગડા છે?"', roman: 'akbare birbalne puchhyu, "shahermaa ketla kagda chhe?"', english: 'Akbar asked Birbal, "How many crows are in the city?"' },
      { gujarati: 'બીરબલ શાંત રહ્યો અને વિચાર્યો.', roman: 'birbal shant rahyo ane vicharyo.', english: 'Birbal stayed calm and thought.' },
      { gujarati: 'તે બોલ્યો, "મહારાજ, નવ હજાર નવસો નવ્વાણું."', roman: 'te bolyo, "maharaj, nav hajar navso navvanu."', english: 'He said, "Your Majesty, nine thousand nine hundred ninety-nine."' },
      { gujarati: 'અકબરે પૂછ્યું, "જો ઓછા કે વધારે હોય તો?"', roman: 'akbare puchhyu, "jo ochha ke vadhare hoy to?"', english: 'Akbar asked, "What if there are fewer or more?"' },
      { gujarati: 'બીરબલે કહ્યું, "મહેમાન આવ્યા હશે, અથવા પોતાના ગામ ગયા હશે."', roman: 'birbale kahyu, "maheman aavya hashe, athva potana gaam gaya hashe."', english: 'Birbal said, "Some may be visiting, or some may have gone home."' },
    ],
    moralGujarati: 'શાંત વિચારથી ચતુર જવાબ મળે છે.',
    moralEnglish: 'Clever answers need calm thinking.',
  },

  {
    id: 'vikram-betal-riddle',
    titleGujarati: 'વિક્રમ-બેતાલની વાર્તા',
    titleEnglish: 'Vikram and Betal’s Riddle',
    level: 3,
    lines: [
      { gujarati: 'રાજા વિક્રમ બેતાલને લઈને ચાલતા હતા.', roman: 'raja vikram betalne laine chalta hata.', english: 'King Vikram walked carrying Betal.' },
      { gujarati: 'બેતાલે એક મુશ્કેલ કોયડો પૂછ્યો.', roman: 'betale ek mushkel koydo puchhyo.', english: 'Betal asked a difficult riddle.' },
      { gujarati: 'કોયડામાં ત્રણ લોકો સાચું કહેતા હતા.', roman: 'koydamaa tran loko sachu kehta hata.', english: 'In the riddle, three people spoke truthfully.' },
      { gujarati: 'વિક્રમે દરેકની વાત ન્યાયથી તોલી.', roman: 'vikrame darekni vaat nyaythi toli.', english: 'Vikram judged each person’s words fairly.' },
      { gujarati: 'બેતાલે કહ્યું, "તમે સમજદારીથી નિર્ણય કર્યો."', roman: 'betale kahyu, "tame samajdarithi nirnay karyo."', english: 'Betal said, "You made a wise judgment."' },
    ],
    moralGujarati: 'સમજદારી એટલે ન્યાયથી નિર્ણય કરવો.',
    moralEnglish: 'Wisdom means judging fairly.',
  },

  {
    id: 'miya-fuski-clever-escape',
    titleGujarati: 'મિયા ફુસકીની ચતુરાઈ',
    titleEnglish: 'Miya Fuski’s Clever Escape',
    level: 3,
    lines: [
      { gujarati: 'મિયા ફુસકી રસ્તામાં મુશ્કેલીમાં ફસાયા.', roman: 'miya fuski rastamaa mushkelimaa fasaya.', english: 'Miya Fuski got into trouble on the road.' },
      { gujarati: 'બે લોકો તેમને છેતરવા માંગતા હતા.', roman: 'be loko temne chhetarva mangta hata.', english: 'Two people wanted to trick him.' },
      { gujarati: 'મિયાએ હસીને કહ્યું, "પહેલા સવાલનો જવાબ આપો."', roman: 'miyae hasine kahyu, "pahela savalno jawab aapo."', english: 'Miya smiled and said, "First answer my question."' },
      { gujarati: 'તેમના સરળ સવાલથી લોકો ગૂંચવાઈ ગયા.', roman: 'temna saral savalthi loko gunchvai gaya.', english: 'His simple question confused them.' },
      { gujarati: 'મિયા ફુસકી બુદ્ધિ અને મજાથી છટકી ગયા.', roman: 'miya fuski buddhi ane majathi chhataki gaya.', english: 'Miya Fuski escaped with wit and humor.' },
    ],
    moralGujarati: 'હાસ્ય અને સામાન્ય સમજ મુશ્કેલી હલ કરે છે.',
    moralEnglish: 'Humor and common sense solve problems.',
  },

  // ===== NEW STORIES — Tenali Raman, Krishna, Gujarati Folk, Panchatantra =====

  {
    id: 'tenali-brinjal',
    titleGujarati: 'તેનાલી રામ અને બેંગણ',
    titleEnglish: 'Tenali Rama and the Brinjal',
    level: 2,
    lines: [
      { gujarati: 'રાજાના બગીચામાં વિશેષ બેંગણ ઊગ્યા.', roman: 'raja na bagichamaan vishesh bengan ugya.', english: 'Special brinjals grew in the king\'s garden.' },
      { gujarati: 'રાજાએ કહ્યું, "કોઈને લેવા નહિ."', roman: 'rajae kahyu, "koi ne leva nahi."', english: 'The king said, "No one should take them."' },
      { gujarati: 'તેનાલી રામને બેંગણ ખાવા મન થયું.', roman: 'tenali ramne bengan khava man thayu.', english: 'Tenali Rama felt like eating brinjals.' },
      { gujarati: 'તેણે રાત્રે બેંગણ લઈ લીધા.', roman: 'tene ratre bengan lai lidha.', english: 'He took brinjals at night.' },
      { gujarati: 'તેણે પરિવાર સાથે બેંગણની સબજી ખાધી.', roman: 'tene parivar sathe bengan ni sabji khaadhi.', english: 'He ate brinjal curry with his family.' },
      { gujarati: 'રાજાએ ખબર પાડી અને પૂછ્યું.', roman: 'rajae khabar paadi ane puchhyu.', english: 'The king found out and asked.' },
      { gujarati: 'તેનાલીએ કહ્યું, "ચોરે લઈ ગયા!"', roman: 'tenalie kahyu, "chore lai gaya!"', english: 'Tenali said, "A thief took them!"' },
      { gujarati: 'રાજા હસ્યા અને ક્ષમા કરી.', roman: 'raja hasya ane kshama kari.', english: 'The king laughed and forgave him.' },
    ],
    focusWords: [
      { gujarati: 'બેંગણ', roman: 'bengan', english: 'brinjal' },
      { gujarati: 'બગીચું', roman: 'bagichu', english: 'garden' },
      { gujarati: 'રાજા', roman: 'raja', english: 'king' },
      { gujarati: 'ચોર', roman: 'chor', english: 'thief' },
    ],
    moralGujarati: 'સત્ય હંમેશા પ્રકાશમાં આવે છે.',
    moralEnglish: 'Truth always comes to light.',
    questionGujarati: 'તેનાલી રામે શું કર્યું?',
    questionEnglish: 'What did Tenali Rama do?',
  },

  {
    id: 'tenali-cat-rice',
    titleGujarati: 'તેનાલી અને બિલાડીનો ચોર',
    titleEnglish: 'Tenali and the Cat Thief',
    level: 2,
    lines: [
      { gujarati: 'રાજાનો ચોર બજારમાં ચોરી કરતો હતો.', roman: 'raja no chor bajaar maan chori karto hato.', english: 'A thief was stealing in the market.' },
      { gujarati: 'લોકોએ તેનાલી પાસે ફરિયાદ કરી.', roman: 'loko e tenali pase fariyaad kari.', english: 'People complained to Tenali.' },
      { gujarati: 'તેનાલીએ એક બિલાડી પકડી.', roman: 'tenalie ek biladi pakdi.', english: 'Tenali caught a cat.' },
      { gujarati: 'તેણે બિલાડીને છોડી અ���ે કહ્યું, "આ ચોર છે!"', roman: 'tene biladi chhodi ane kahyu, "aa chor chhe!"', english: 'He released the cat and said, "This is the thief!"' },
      { gujarati: 'બધા હસ્યા.', roman: 'badha hasya.', english: 'Everyone laughed.' },
      { gujarati: 'અસલી ચોર ડરીને ભાગી ગયો.', roman: 'asli chor darine bhagi gayo.', english: 'The real thief ran away in fear.' },
      { gujarati: 'બુદ્ધિથી મુશ્કેલી હલ થાય.', roman: 'buddhithi mushkeli hal thay.', english: 'Wisdom can solve a problem.' },
    ],
    focusWords: [
      { gujarati: 'ચોર', roman: 'chor', english: 'thief' },
      { gujarati: 'બજાર', roman: 'bajaar', english: 'market' },
      { gujarati: 'બિલાડી', roman: 'biladi', english: 'cat' },
      { gujarati: 'ડર', roman: 'dar', english: 'fear' },
    ],
    moralGujarati: 'હાસ્ય અને બુદ્ધિ મુશ્કેલી હલ કરે છે.',
    moralEnglish: 'Humor and wisdom can solve problems.',
    questionGujarati: 'તેનાલીએ કોને પકડ્યું?',
    questionEnglish: 'Who did Tenali catch?',
  },

  {
    id: 'krishna-butter',
    titleGujarati: 'કૃષ્ણ અને મ��ખણ',
    titleEnglish: 'Krishna and the Butter',
    level: 1,
    lines: [
      { gujarati: 'નાનો કૃષ્ણ ઘરમાં હતો.', roman: 'nano krishna gharamaan hato.', english: 'Little Krishna was at home.' },
      { gujarati: 'માએ માખણ ઊંચે મૂક્યું.', roman: 'mae makhan unche mukyu.', english: 'Mother put butter high up.' },
      { gujarati: 'કૃષ્ણ માખણ ચોરવા માંગતો હતો.', roman: 'krishna makhan chorva mangto hato.', english: 'Krishna wanted to steal the butter.' },
      { gujarati: 'તેણે મોટો હડપેટો મૂક્યો અને માખણ લીધું.', roman: 'tene moto hadpeto mukyo ane makhan lidhu.', english: 'He placed a big pot and climbed up to get the butter.' },
      { gujarati: 'કૃષ્ણે માખણ ખાધું.', roman: 'krishnae makhan khaadhu.', english: 'Krishna ate the butter.' },
      { gujarati: 'મા આવી અને પૂછ્યું, "કોણે ખાધું?"', roman: 'ma aavi ane puchhyu, "kone khaadhu?"', english: 'Mother came and asked, "Who ate it?"' },
      { gujarati: 'કૃષ્ણ હસ્યો.', roman: 'krishna hasyo.', english: 'Krishna smiled.' },
      { gujarati: 'બધા કૃષ્ણ��ે ચાહતા હતા.', roman: 'badha krishna ne chaahata hata.', english: 'Everyone loved Krishna.' },
    ],
    focusWords: [
      { gujarati: 'કૃષ્ણ', roman: 'krishna', english: 'Krishna' },
      { gujarati: 'માખણ', roman: 'makhan', english: 'butter' },
      { gujarati: 'મા', roman: 'maa', english: 'mother' },
      { gujarati: 'હાસો', roman: 'haso', english: 'smile' },
    ],
    moralGujarati: 'પ્રેમ ભૂલને માફ કરે છે.',
    moralEnglish: 'Love forgives mistakes.',
    questionGujarati: 'કૃષ્ણે શું ખાધું?',
    questionEnglish: 'What did Krishna eat?',
  },

  {
    id: 'krishna-kalia',
    titleGujarati: 'કૃષ્ણ અને કાલિયો સાપ',
    titleEnglish: 'Krishna and the Kalia Snake',
    level: 3,
    lines: [
      { gujarati: 'યમુના નદીમાં કાલિયો સાપ રહેતો હતો.', roman: 'yamuna nadimaan kaliyo saap raheto hato.', english: 'The Kalia snake lived in the Yamuna river.' },
      { gujarati: 'સાપે પાણી ઝેરી કરી દીધું.', roman: 'saape paani zheri kari didhu.', english: 'The snake made the water poisonous.' },
      { gujarati: 'પ્રાણીઓ ડ���તા હતા.', roman: 'pranio darata hata.', english: 'The animals were afraid.' },
      { gujarati: 'કૃષ્ણ પાણીમાં કૂદ્યો.', roman: 'krishna paanimaan kudyo.', english: 'Krishna jumped into the water.' },
      { gujarati: 'કૃષ્ણે સાપ પર નાચ્યો.', roman: 'krishnae saap par nachyo.', english: 'Krishna danced on the snake.' },
      { gujarati: 'સાપે હાર માન્યો.', roman: 'saape haar manyo.', english: 'The snake gave up.' },
      { gujarati: 'કૃષ્ણે સાપને જવા કહ્યું.', roman: 'krishnae saapne java kahyu.', english: 'Krishna told the snake to leave.' },
      { gujarati: 'નદી ફરી સ્વચ્છ થઈ.', roman: 'nadi fari svachchh thai.', english: 'The river became clean again.' },
    ],
    focusWords: [
      { gujarati: 'કૃષ્ણ', roman: 'krishna', english: 'Krishna' },
      { gujarati: 'સાપ', roman: 'saap', english: 'snake' },
      { gujarati: 'નદી', roman: 'nadi', english: 'river' },
      { gujarati: 'પાણી', roman: 'paani', english: 'water' },
    ],
    moralGujarati: 'હિંમતથી મોટો દુશ્મન પણ હરે.',
    moralEnglish: 'Courage can defeat even a big enemy.',
    questionGujarati: 'કૃષ્ણે સાપ પર શું કર્યું?',
    questionEnglish: 'What did Krishna do on the snake?',
  },

  {
    id: 'tenali-fool-list',
    titleGujarati: 'તેનાલીની મૂર્ખોની યાદી',
    titleEnglish: 'Tenali\'s List of Fools',
    level: 3,
    lines: [
      { gujarati: 'રાજાએ તેનાલીને મૂર્ખોની યાદી માંગી.', roman: 'rajae tenali ne mookho ni yadi maangi.', english: 'The king asked Tenali for a list of fools.' },
      { gujarati: 'તેનાલીએ રાજાનું નામ પહેલા લખ્યું.', roman: 'tenalie raja nu naam pahela lakhyu.', english: 'Tenali wrote the king\'s name first.' },
      { gujarati: 'રાજા ગુસ્સે થયા.', roman: 'raja gusse thaya.', english: 'The king became angry.' },
      { gujarati: 'તેનાલીએ કહ્યું, "અજાણ્યા પર વિશ્વાસ કરવો એ મૂર્ખતા છે."', roman: 'tenalie kahyu, "ajanya par vishvas karvo e mookhta chhe."', english: 'Tenali said, "Trusting a stranger is foolishness."' },
      { gujarati: 'રાજાને સમજાયું અને તેઓ હસ્યા.', roman: 'raja ne samajayu ane te hasya.', english: 'The king understood and laughed.' },
      { gujarati: 'બુદ્ધિથી મોટાને પણ સમજાવી શકાય.', roman: 'buddhithi mota ne pan samajavi shakay.', english: 'With wisdom, even great people can be taught.' },
    ],
    focusWords: [
      { gujarati: 'મૂર્ખ', roman: 'mookh', english: 'fool' },
      { gujarati: 'યાદી', roman: 'yadi', english: 'list' },
      { gujarati: 'રાજા', roman: 'raja', english: 'king' },
      { gujarati: 'વિશ્વાસ', roman: 'vishvas', english: 'trust' },
    ],
    moralGujarati: 'વિશ્વાસ સમજદારીથી કરવો.',
    moralEnglish: 'Trust with care.',
    questionGujarati: 'તેનાલીએ યાદીમાં કોનું નામ લખ્યું?',
    questionEnglish: 'Whose name did Tenali write on the list?',
  },

  {
    id: 'deer-lion-rabbit',
    titleGujarati: 'હરણ, સિંહ અને સસલું',
    titleEnglish: 'The Deer, the Lion, and the Rabbit',
    level: 2,
    lines: [
      { gujarati: 'સિંહ એક હરણને મળ્યો.', roman: 'sinh ek haran ne malyo.', english: 'A lion met a deer.' },
      { gujarati: 'સિંહે હરણને ખાવા નીચા આવવા કહ્યું.', roman: 'sinhe haran ne khava nicha aavva kahyu.', english: 'The lion told the deer to come down to be eaten.' },
      { gujarati: 'હરણ ડરી ગયું.', roman: 'haran dari gayu.', english: 'The deer got scared.' },
      { gujarati: 'એક સસલું ત્યાં આવ્યું.', roman: 'ek saslu tyaan aavyu.', english: 'A rabbit came there.' },
      { gujarati: 'સસલાએ હરણને ભાગવા કહ્યું.', roman: 'saslae haran ne bhagva kahyu.', english: 'The rabbit told the deer to run.' },
      { gujarati: 'હરણ ભાગી ગયું.', roman: 'haran bhagi gayu.', english: 'The deer ran away.' },
      { gujarati: 'સસલું પણ ભાગી ગયું.', roman: 'saslu pan bhagi gayu.', english: 'The rabbit also ran away.' },
      { gujarati: 'સિંહ ભૂખ્યો રહ્યો.', roman: 'sinh bhookhyo rahyo.', english: 'The lion remained hungry.' },
    ],
    focusWords: [
      { gujarati: 'હરણ', roman: 'haran', english: 'deer' },
      { gujarati: 'સસલું', roman: 'saslu', english: 'rabbit' },
      { gujarati: 'સિંહ', roman: 'sinh', english: 'lion' },
      { gujarati: 'ભાગવું', roman: 'bhagvu', english: 'to run' },
    ],
    moralGujarati: 'મિત્રની સલાહ ��ીવ બચાવે.',
    moralEnglish: 'A friend\'s advice can save your life.',
    questionGujarati: 'સસલાએ હરણને શું કહ્યું?',
    questionEnglish: 'What did the rabbit tell the deer?',
  },

  {
    id: 'mouse-lion-grateful',
    titleGujarati: 'ચૂહો અને સિંહની દાતણ',
    titleEnglish: 'The Mouse and the Lion\'s Tooth',
    level: 1,
    lines: [
      { gujarati: 'સિંહના દાતમાં કદં હતો.', roman: 'sinh na daat maan kadam hato.', english: 'The lion had a thorn in his tooth.' },
      { gujarati: 'સિંહ દુઃખી હતો.', roman: 'sinh dukkhi hato.', english: 'The lion was in pain.' },
      { gujarati: 'એક ચૂહો આવ્યો.', roman: 'ek choho aavyo.', english: 'A mouse came.' },
      { gujarati: 'ચૂહાએ કદં કાઢી નાખ્યો.', roman: 'chohae kadam kaadhi naakhyo.', english: 'The mouse pulled out the thorn.' },
      { gujarati: 'સિંહ ખુશ થયો.', roman: 'sinh khush thayo.', english: 'The lion was happy.' },
      { gujarati: 'ચૂહો અને સિંહ મિત્ર બન્યા.', roman: 'choho ane sinh mitr banya.', english: 'The mouse and lion became friends.' },
    ],
    focusWords: [
      { gujarati: 'સિંહ', roman: 'sinh', english: 'lion' },
      { gujarati: 'ચૂહો', roman: 'choho', english: 'mouse' },
      { gujarati: 'દાત', roman: 'daat', english: 'tooth' },
      { gujarati: 'મિત્ર', roman: 'mitr', english: 'friend' },
    ],
    moralGujarati: 'નાની મદદ પણ મોટી ગણાય.',
    moralEnglish: 'Even small help counts a lot.',
    questionGujarati: 'ચૂહાએ સિંહના દાતમાંથી શું કાઢ્યું?',
    questionEnglish: 'What did the mouse pull from the lion\'s tooth?',
  },

  {
    id: 'cobra-mongoose',
    titleGujarati: 'સાપ અને નાળિયેર',
    titleEnglish: 'The Cobra and the Mongoose',
    level: 2,
    lines: [
      { gujarati: 'એક ઘરમાં સાપ અને નાળિયેર રહેતા.', roman: 'ek gharamaan saap ane naliyar reheta.', english: 'A snake and a mongoose lived in a house.' },
      { gujarati: 'બન્ને દુશ્મન હતા.', roman: 'banne dushman hata.', english: 'They were enemies.' },
      { gujarati: 'ઘરના બાળકને સાપે ગમ્યો.', roman: 'ghar na baalak ne saape gamyo.', english: 'The snake liked the house child.' },
      { gujarati: 'એક દિવસ બ���ળક સાથે રમતું હતું.', roman: 'ek divas baalak sathe ramtu hatu.', english: 'One day the child was playing.' },
      { gujarati: 'સાપે બાળકને બચાવ્યું.', roman: 'saape baalak ne bachavyu.', english: 'The snake saved the child.' },
      { gujarati: 'પણ લોકોએ સાપને ખરાબ સમજ્યો.', roman: 'pan loko e saap ne kharaab samajyo.', english: 'But people misunderstood the snake.' },
      { gujarati: 'સાચી વાત જાણી ત્યારે પસ્તાવો થયો.', roman: 'sachi vaat jaani tyare pastavo thayo.', english: 'When they learned the truth, they regretted.' },
    ],
    focusWords: [
      { gujarati: 'સાપ', roman: 'saap', english: 'snake' },
      { gujarati: 'નાળિયેર', roman: 'naliyar', english: 'mongoose' },
      { gujarati: 'બાળક', roman: 'baalak', english: 'child' },
      { gujarati: 'દુશ્મન', roman: 'dushman', english: 'enemy' },
    ],
    moralGujarati: 'સત્ય જાણ્યા વગર નિર્ણય ન કરવો.',
    moralEnglish: 'Do not judge before knowing the truth.',
    questionGujarati: 'સાપે બાળકને શું કર્યું?',
    questionEnglish: 'What did the snake do for the child?',
  },

  {
    id: 'frogs-rope-snake',
    titleGujarati: 'દુધાળ અને સાપનો દોરવો',
    titleEnglish: 'The Frogs and the Snake Rope',
    level: 3,
    lines: [
      { gujarati: 'સાપ વૃદ્ધ થયો અને શિકાર કરી શકતો નહોતો.', roman: 'saap vruddh thayo ane shikaar kari shakto nahoto.', english: 'A snake grew old and could not hunt.' },
      { gujarati: 'તેણે દુધાળ પાસે જઈ કહ્યું, "હું તમારો સાથી છું."', roman: 'tene doodhaal pase jai kahyu, "hu tamaaro saathi chhu."', english: 'He went to the frogs and said, "I am your friend."' },
      { gujarati: 'સાપે કહ્યું, "મને દોરવે બાંધીને લઈ જાઓ."', roman: 'saape kahyu, "mane dorve baandhine lai jao."', english: 'The snake said, "Carry me on a rope."' },
      { gujarati: 'દુધાળો સાપને દોરવે બાંધી લઈ ગયા.', roman: 'doodhaalo saap ne dorve baandhi lai gaya.', english: 'The frogs carried the snake on a rope.' },
      { gujarati: 'સાપ ધીમે ધીમે દુધાળ ખાવા લાગ્યો.', roman: 'saap dhime dhime doodhaal khaava lagyo.', english: 'The snake slowly started eating the frogs.' },
      { gujarati: 'એક દિવસ બધા દુધાળ ગયા.', roman: 'ek divas badha doodhaal gaya.', english: 'One day all the frogs were gone.' },
      { gujarati: 'ખોટા મિત્રથી સાવધાન રહેવું.', roman: 'khot mitrthi savdhaan rehevu.', english: 'Beware of false friends.' },
    ],
    focusWords: [
      { gujarati: 'સાપ', roman: 'saap', english: 'snake' },
      { gujarati: 'દુધાળ', roman: 'doodhaal', english: 'frog' },
      { gujarati: 'દોરવો', roman: 'dorvo', english: 'rope' },
      { gujarati: 'મિત્ર', roman: 'mitr', english: 'friend' },
    ],
    moralGujarati: 'ખોટા મિત્ર મોટો સંકટ લાવે.',
    moralEnglish: 'A false friend brings great danger.',
    questionGujarati: 'સાપે દુધાળને ક્યાં લઈ ગયો?',
    questionEnglish: 'Where did the snake take the frogs?',
  },

  {
    id: 'sparrow-grain',
    titleGujarati: 'ચકલી અને એક દાણું',
    titleEnglish: 'The Sparrow and a Single Grain',
    level: 1,
    lines: [
      { gujarati: 'એક ચકલી દાણા શોધતી હતી.', roman: 'ek chakli daana shodhti hati.', english: 'A sparrow was searching for grains.' },
      { gujarati: 'તેને એક દાણું મળ્યું.', roman: 'tene ek daanu malyu.', english: 'She found one grain.' },
      { gujarati: 'ચકલી ખુશ થઈ.', roman: 'chakli khushi thai.', english: 'The sparrow became happy.' },
      { gujarati: 'તેણે દાણું બચ્ચાને આપ્યું.', roman: 'tene daanu bachaa ne aapyu.', english: 'She gave the grain to her chicks.' },
      { gujarati: 'બચ્ચાએ દાણું ખાધું.', roman: 'bachaae daanu khaadhu.', english: 'The chicks ate the grain.' },
      { gujarati: 'મહેનત કરે તેને પેટ ભરે.', roman: 'mehnat kare tene pet bhare.', english: 'Hard work fills the stomach.' },
    ],
    focusWords: [
      { gujarati: 'ચકલી', roman: 'chakli', english: 'sparrow' },
      { gujarati: 'દાણું', roman: 'daanu', english: 'grain' },
      { gujarati: 'બચ્ચું', roman: 'bachu', english: 'chick' },
      { gujarati: 'મહેનત', roman: 'mehnat', english: 'hard work' },
    ],
    moralGujarati: 'મહેનત કરવાથી અન્ન મળે.',
    moralEnglish: 'Hard work brings food.',
    questionGujarati: 'ચકલીને શું મળ્યું?',
    questionEnglish: 'What did the sparrow find?',
  },

  {
    id: 'old-lamp-new',
    titleGujarati: 'જૂનો દીવો નવો પ્રકાશ',
    titleEnglish: 'The Old Lamp Shines Again',
    level: 2,
    lines: [
      { gujarati: 'એક જૂનો દીવો ખૂણામાં હતો.', roman: 'ek juno divo kunamaan hato.', english: 'An old lamp was in a corner.' },
      { gujarati: 'કોઈ તેને જલાવતું નહોતું.', roman: 'koi tene jalavtu nahotu.', english: 'No one lit it.' },
      { gujarati: 'દીવો ઉદાસ હતો.', roman: 'divo udaas hato.', english: 'The lamp was sad.' },
      { gujarati: 'એક બાળક આવ્યું અને દીવો જલાવ્યો.', roman: 'ek baalak aavyu ane divo jalavyo.', english: 'A child came and lit the lamp.' },
      { gujarati: 'દીવો ફરી ચમક્યો.', roman: 'divo fari chamkyo.', english: 'The lamp shone again.' },
      { gujarati: 'ઘર પ્રકાશથી ભરાઈ ગયું.', roman: 'ghar prakaashthi bharai gayu.', english: 'The house filled with light.' },
      { gujarati: 'દરેકને મોકો આપો તો ચમકે.', roman: 'darek ne moko aapo to chamke.', english: 'Give everyone a chance and they can shine.' },
    ],
    focusWords: [
      { gujarati: 'દીવો', roman: 'divo', english: 'lamp' },
      { gujarati: 'પ્રકાશ', roman: 'prakaash', english: 'light' },
      { gujarati: 'ઘર', roman: 'ghar', english: 'house' },
      { gujarati: 'બાળક', roman: 'baalak', english: 'child' },
    ],
    moralGujarati: 'દરેકને મોકો આપો, પ્રકાશ મળશે.',
    moralEnglish: 'Give everyone a chance and light will shine.',
    questionGujarati: 'કોણે દીવો જલાવ્યો?',
    questionEnglish: 'Who lit the lamp?',
  },

  {
    id: 'four-brahmins-lion',
    titleGujarati: 'ચાર બ્રાહ્મણ અને સિંહ',
    titleEnglish: 'The Four Brahmins and the Lion',
    level: 3,
    lines: [
      { gujarati: 'ચાર મિત્રો જંગલમાં ગયા.', roman: 'chaar mitro jangalmaan gaya.', english: 'Four friends went into the forest.' },
      { gujarati: 'તેમને એક સિંહના હાડકા મળ્યા.', roman: 'temne ek sinh na hadka malya.', english: 'They found a lion\'s bones.' },
      { gujarati: 'એક મિત્રે હાડકા જોડી સિંહ બનાવ્યો.', roman: 'ek mitre hadka jodi sinh banavyo.', english: 'One friend assembled the bones into a lion.' },
      { gujarati: 'બીજાએ સિંહ પર ચામડી ચડાવી.', roman: 'bijaae sinh par chamdi chadavi.', english: 'Another put skin on the lion.' },
      { gujarati: 'ત્રીજાએ સિંહને જીવતો કર્યો.', roman: 'trijaae sinh ne jivto karyo.', english: 'A third brought the lion to life.' },
      { gujarati: 'સિંહે ત્રણ મિત્ર ખાધા.', roman: 'sinhe tran mitr khaadha.', english: 'The lion ate the three friends.' },
      { gujarati: 'ચોથા મિત્ર પહેલા જ ભાગી ગયો હતો.', roman: 'chotha mitr pahela j bhagi gayo hato.', english: 'The fourth friend had already run away.' },
      { gujarati: 'વિદ્યા સમજદારીથી વાપરવી.', roman: 'vidya samajdarithi vaaparvi.', english: 'Use knowledge wisely.' },
    ],
    focusWords: [
      { gujarati: 'મિત્ર', roman: 'mitr', english: 'friend' },
      { gujarati: 'સિંહ', roman: 'sinh', english: 'lion' },
      { gujarati: 'હાડકા', roman: 'hadka', english: 'bones' },
      { gujarati: 'વિદ્યા', roman: 'vidya', english: 'knowledge' },
    ],
    moralGujarati: 'વિદ્યા સમજદારીથી વાપરવી.',
    moralEnglish: 'Use knowledge with wisdom.',
    questionGujarati: 'સિંહે કેટલા મિત્ર ખાધા?',
    questionEnglish: 'How many friends did the lion eat?',
  },
];

export interface Balgeet {
  id: string;
  titleGujarati: string;
  titleEnglish: string;
  lines: { gujarati: string; roman: string; english: string }[];
}

export const balgeet: Balgeet[] = [
  {
    id: 'chakki-ben',
    titleGujarati: 'ચક્કીબેન ચક્કીબેન',
    titleEnglish: 'Chakki Ben (Little Sparrow)',
    lines: [
      { gujarati: 'ચક્કીબેન ચક્કીબેન', roman: 'Chakki ben, chakki ben', english: 'Little sparrow, little sparrow' },
      { gujarati: 'મારી સાથે રમવા આવશો કે નહિ?', roman: 'Mari sathe ramva aavsho ke nahi?', english: 'Will you come play with me or not?' },
      { gujarati: 'બેસવાને પાટલો', roman: 'Besvane patlo', english: 'A stool to sit on' },
      { gujarati: 'સૂવાને ખાટલો', roman: 'Suvane khatlo', english: 'A bed to sleep on' },
      { gujarati: 'ઓઢવાને પીંછા આપીશ તને', roman: 'Odhvane pincha aapish tane', english: 'I will give you feathers to cover yourself' },
    ]
  },
  {
    id: 'ek-bilaadi',
    titleGujarati: 'એક બિલાડી જાડી',
    titleEnglish: 'Ek Biladi Jadi (One Fat Cat)',
    lines: [
      { gujarati: 'એક બિલાડી જાડી', roman: 'Ek biladi jadi', english: 'One fat cat' },
      { gujarati: 'તેણે પહેરી સાડી', roman: 'Tene pehri sadi', english: 'She wore a sari' },
      { gujarati: 'સાડી પહેરી ફરવા ગઈ', roman: 'Sadi pehri farva gai', english: 'Wearing a sari she went for a walk' },
      { gujarati: 'તળાવમાં તો તરવા ગઈ', roman: 'Talavma to tarva gai', english: 'She went to swim in the pond' },
    ]
  }
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
  surat: { emoji: '💎', label: 'Surat City', color: '#6366F1' },
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
