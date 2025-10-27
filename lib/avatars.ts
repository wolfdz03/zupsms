// Fun Avatar Library for Tutors
// Each avatar has a unique gradient and emoji/icon combination

export type AvatarCategory = "animals" | "abstract" | "patterns" | "characters";

export interface Avatar {
  id: string;
  emoji: string;
  gradient: string;
  category: AvatarCategory;
  name: string;
}

export const avatars: Avatar[] = [
  // Animals
  { id: "fox", emoji: "🦊", gradient: "from-orange-400 to-red-500", category: "animals", name: "Fox" },
  { id: "panda", emoji: "🐼", gradient: "from-gray-400 to-gray-700", category: "animals", name: "Panda" },
  { id: "lion", emoji: "🦁", gradient: "from-yellow-400 to-orange-600", category: "animals", name: "Lion" },
  { id: "owl", emoji: "🦉", gradient: "from-amber-500 to-brown-600", category: "animals", name: "Owl" },
  { id: "elephant", emoji: "🐘", gradient: "from-gray-500 to-blue-500", category: "animals", name: "Elephant" },
  { id: "penguin", emoji: "🐧", gradient: "from-cyan-400 to-blue-600", category: "animals", name: "Penguin" },
  { id: "rabbit", emoji: "🐰", gradient: "from-pink-300 to-rose-400", category: "animals", name: "Rabbit" },
  { id: "turtle", emoji: "🐢", gradient: "from-green-500 to-emerald-700", category: "animals", name: "Turtle" },
  { id: "koala", emoji: "🐨", gradient: "from-slate-400 to-gray-600", category: "animals", name: "Koala" },
  { id: "tiger", emoji: "🐯", gradient: "from-orange-500 to-amber-700", category: "animals", name: "Tiger" },
  
  // Abstract
  { id: "star", emoji: "⭐", gradient: "from-yellow-400 to-yellow-600", category: "abstract", name: "Star" },
  { id: "fire", emoji: "🔥", gradient: "from-red-500 to-orange-600", category: "abstract", name: "Fire" },
  { id: "rocket", emoji: "🚀", gradient: "from-blue-500 to-purple-600", category: "abstract", name: "Rocket" },
  { id: "lightning", emoji: "⚡", gradient: "from-yellow-300 to-orange-500", category: "abstract", name: "Lightning" },
  { id: "diamond", emoji: "💎", gradient: "from-cyan-400 to-blue-600", category: "abstract", name: "Diamond" },
  { id: "trophy", emoji: "🏆", gradient: "from-yellow-500 to-amber-600", category: "abstract", name: "Trophy" },
  { id: "heart", emoji: "❤️", gradient: "from-pink-500 to-rose-600", category: "abstract", name: "Heart" },
  { id: "rainbow", emoji: "🌈", gradient: "from-pink-400 via-purple-400 to-blue-400", category: "abstract", name: "Rainbow" },
  { id: "crystal", emoji: "🔮", gradient: "from-purple-500 to-indigo-600", category: "abstract", name: "Crystal" },
  { id: "sun", emoji: "☀️", gradient: "from-yellow-400 to-orange-500", category: "abstract", name: "Sun" },
  
  // Patterns
  { id: "waves", emoji: "🌊", gradient: "from-blue-400 to-cyan-600", category: "patterns", name: "Waves" },
  { id: "mountain", emoji: "⛰️", gradient: "from-slate-500 to-gray-700", category: "patterns", name: "Mountain" },
  { id: "flower", emoji: "🌸", gradient: "from-pink-400 to-rose-500", category: "patterns", name: "Flower" },
  { id: "leaf", emoji: "🍃", gradient: "from-green-400 to-emerald-600", category: "patterns", name: "Leaf" },
  { id: "snowflake", emoji: "❄️", gradient: "from-cyan-300 to-blue-500", category: "patterns", name: "Snowflake" },
  { id: "bubble", emoji: "🫧", gradient: "from-cyan-200 to-blue-400", category: "patterns", name: "Bubble" },
  { id: "sparkles", emoji: "✨", gradient: "from-purple-400 to-pink-500", category: "patterns", name: "Sparkles" },
  { id: "cherry", emoji: "🍒", gradient: "from-red-400 to-rose-600", category: "patterns", name: "Cherry" },
  
  // Characters
  { id: "ninja", emoji: "🥷", gradient: "from-slate-700 to-gray-900", category: "characters", name: "Ninja" },
  { id: "wizard", emoji: "🧙", gradient: "from-purple-600 to-indigo-800", category: "characters", name: "Wizard" },
  { id: "robot", emoji: "🤖", gradient: "from-slate-500 to-blue-600", category: "characters", name: "Robot" },
  { id: "alien", emoji: "👽", gradient: "from-green-500 to-lime-600", category: "characters", name: "Alien" },
  { id: "vampire", emoji: "🧛", gradient: "from-red-700 to-purple-900", category: "characters", name: "Vampire" },
  { id: "mermaid", emoji: "🧜", gradient: "from-teal-400 to-cyan-600", category: "characters", name: "Mermaid" },
  { id: "superhero", emoji: "🦸", gradient: "from-blue-600 to-indigo-700", category: "characters", name: "Superhero" },
  { id: "fairy", emoji: "🧚", gradient: "from-pink-400 to-purple-500", category: "characters", name: "Fairy" },
];

// Helper functions
export const getAvatarById = (id: string): Avatar | undefined => {
  return avatars.find(avatar => avatar.id === id);
};

export const getAvatarsByCategory = (category: AvatarCategory): Avatar[] => {
  return avatars.filter(avatar => avatar.category === category);
};

export const getDefaultAvatar = (): Avatar => {
  return avatars[0]; // Fox as default
};

export const categories: { value: AvatarCategory; label: string }[] = [
  { value: "animals", label: "Animals" },
  { value: "abstract", label: "Abstract" },
  { value: "patterns", label: "Patterns" },
  { value: "characters", label: "Characters" },
];

