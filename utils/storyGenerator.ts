import { Word } from "@/contexts/VocabularyContext";

export interface StoryParams {
  genre: string;
  targetWords: Word[];
}

export interface GeneratedStory {
  title: string;
  content: string;
  genre: string;
  targetWords: Word[];
}

// ダミーストーリー生成関数
export function mockGenerateStory(params: StoryParams): GeneratedStory {
  const { genre, targetWords } = params;
  
  // ジャンルに応じたテンプレート
  const genreTemplates: Record<string, string> = {
    biography: `In the annals of history, few individuals have demonstrated such remarkable ${targetWords[0]?.word || "dedication"} to their craft. This story begins with a person who, through ${targetWords[1]?.word || "perseverance"} and ${targetWords[2]?.word || "determination"}, overcame ${targetWords[3]?.word || "adversity"} to achieve greatness. Their journey was marked by moments of ${targetWords[4]?.word || "triumph"} and learning, teaching us that success is not merely about talent, but about the ${targetWords[0]?.word || "commitment"} to continuous improvement.`,
    
    academic: `This research paper examines the ${targetWords[0]?.word || "phenomenon"} of language acquisition through contextual learning. The study ${targetWords[1]?.word || "demonstrates"} that students who engage with ${targetWords[2]?.word || "authentic"} materials show ${targetWords[3]?.word || "significant"} improvement in vocabulary retention. Our ${targetWords[4]?.word || "analysis"} reveals that the ${targetWords[0]?.word || "methodology"} employed in this approach creates a more ${targetWords[1]?.word || "effective"} learning environment.`,
    
    fairyTale: `Once upon a time, in a land far away, there lived a ${targetWords[0]?.word || "brave"} young person who possessed a ${targetWords[1]?.word || "curious"} nature. They embarked on a journey filled with ${targetWords[2]?.word || "wonder"} and ${targetWords[3]?.word || "adventure"}. Along the way, they discovered that true ${targetWords[4]?.word || "wisdom"} comes not from books, but from experiencing the world with an open heart. The story teaches us that ${targetWords[0]?.word || "courage"} and ${targetWords[1]?.word || "kindness"} are the greatest treasures one can possess.`,
    
    nonfiction: `The world around us is ${targetWords[0]?.word || "complex"} and ${targetWords[1]?.word || "fascinating"}. Through careful ${targetWords[2]?.word || "observation"}, we can discover patterns that reveal the ${targetWords[3]?.word || "intricate"} workings of nature. This exploration requires ${targetWords[4]?.word || "patience"} and a ${targetWords[0]?.word || "methodical"} approach. The more we learn, the more we realize how ${targetWords[1]?.word || "interconnected"} everything truly is.`,
    
    scienceFiction: `In the year 2150, humanity had achieved ${targetWords[0]?.word || "remarkable"} technological ${targetWords[1]?.word || "advancements"}. Scientists discovered a ${targetWords[2]?.word || "revolutionary"} method to enhance human ${targetWords[3]?.word || "capabilities"} through ${targetWords[4]?.word || "neural"} interfaces. However, this ${targetWords[0]?.word || "innovation"} came with ${targetWords[1]?.word || "unforeseen"} consequences that would challenge everything we thought we knew about the nature of consciousness.`
  };

  // デフォルトのストーリー（単語がない場合）
  const defaultStory = `This is a ${genre} story that demonstrates the use of vocabulary in context. Learning new words through reading helps improve language skills. The more you read, the more you learn. Practice makes perfect, and consistency is key to success.`;

  // ターゲット単語を含むストーリーを生成
  let storyContent = genreTemplates[genre] || defaultStory;
  
  // ターゲット単語が少ない場合は、デフォルトのストーリーに単語を組み込む
  if (targetWords.length === 0) {
    storyContent = defaultStory;
  } else {
    // 各ターゲット単語が確実に含まれるように調整
    targetWords.forEach((word, index) => {
      if (!storyContent.toLowerCase().includes(word.word.toLowerCase())) {
        // 単語が含まれていない場合は、適切な位置に挿入
        const sentences = storyContent.split('. ');
        if (sentences.length > index) {
          sentences[index] = sentences[index] + ` The concept of ${word.word} is ${word.meaning} in this context.`;
        }
        storyContent = sentences.join('. ');
      }
    });
  }

  // タイトルを生成
  const genreTitles: Record<string, string> = {
    biography: "A Life of Dedication",
    academic: "Research on Language Learning",
    fairyTale: "The Journey of Discovery",
    nonfiction: "Exploring the Natural World",
    scienceFiction: "The Future of Humanity"
  };

  return {
    title: genreTitles[genre] || "A Story",
    content: storyContent,
    genre: genre,
    targetWords: targetWords
  };
}



