"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useVocabulary, Word } from "@/contexts/VocabularyContext";
import { ArrowLeft, BookOpen } from "lucide-react";
import { GeneratedStory } from "@/utils/storyGenerator";

export default function ReaderPage() {
  const router = useRouter();
  const { missedWords, addMissedWord } = useVocabulary();
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedWordData, setClickedWordData] = useState<{ word: string; meaning?: string } | null>(null);

  useEffect(() => {
    // localStorageからストーリーを読み込む
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("generated_story");
      if (stored) {
        try {
          const parsedStory = JSON.parse(stored);
          setStory(parsedStory);
        } catch (error) {
          console.error("Failed to parse story:", error);
          router.push("/generate");
        }
      } else {
        router.push("/generate");
      }
    }
  }, [router]);

  // 単語をクリック可能な要素に分割
  const renderTextWithClickableWords = (text: string) => {
    // 単語を分割（スペース、句読点で区切る）
    const words = text.split(/(\s+|[.,!?;:])/);
    
    return words.map((word, index) => {
      // 空白や句読点はそのまま表示
      if (/^\s*$/.test(word) || /^[.,!?;:]$/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // 単語をクリック可能に
      const cleanWord = word.replace(/[.,!?;:]/g, "").toLowerCase();
      const isMissedWord = missedWords.some(
        (w) => w.word.toLowerCase() === cleanWord
      );

      return (
        <span
          key={index}
          onClick={() => handleWordClick(word, cleanWord)}
          className={`
            inline-block px-1.5 py-0.5 mx-0.5 rounded cursor-pointer transition-all duration-200
            ${isMissedWord 
              ? "bg-yellow-200 hover:bg-yellow-300 font-semibold shadow-sm" 
              : "hover:bg-blue-100 hover:shadow-sm"
            }
          `}
          title={isMissedWord ? "苦手な単語（クリックで詳細）" : "クリックで単語を追加"}
        >
          {word}
        </span>
      );
    });
  };

  const handleWordClick = (originalWord: string, cleanWord: string) => {
    // 既に苦手リストにあるかチェック
    const existingWord = missedWords.find(
      (w) => w.word.toLowerCase() === cleanWord
    );

    if (existingWord) {
      // 既に苦手リストにある場合は、詳細を表示（オプション）
      setClickedWordData({
        word: originalWord,
        meaning: existingWord.meaning,
      });
      setDialogOpen(true);
    } else {
      // 苦手リストにない場合は追加確認
      setClickedWordData({
        word: originalWord,
      });
      setDialogOpen(true);
    }
  };

  const handleAddToMissedWords = () => {
    if (clickedWordData) {
      const cleanWord = clickedWordData.word.replace(/[.,!?;:]/g, "").toLowerCase();
      
      // 既に存在するかチェック
      const exists = missedWords.some(
        (w) => w.word.toLowerCase() === cleanWord
      );

      if (!exists) {
        // 新しい単語を追加
        const newWord: Word = {
          id: `word_${Date.now()}_${Math.random()}`,
          word: cleanWord,
          meaning: "（意味を確認してください）",
          context: story?.content || "",
        };
        addMissedWord(newWord);
      }
    }
    setDialogOpen(false);
    setClickedWordData(null);
  };

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-600">ストーリーを読み込み中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => router.push("/generate")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <div className="text-sm text-gray-600">
            <BookOpen className="h-4 w-4 inline mr-1" />
            {story.genre}
          </div>
        </div>

        {/* ストーリー表示 */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-12 pb-16 px-8 md:px-16 lg:px-24">
            {/* タイトル */}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-12 text-center leading-tight">
              {story.title}
            </h1>

            {/* 本文 */}
            <div className="text-lg md:text-xl leading-[1.8] text-gray-800 font-serif max-w-3xl mx-auto">
              <div className="space-y-6">
                {renderTextWithClickableWords(story.content)}
              </div>
            </div>

            {/* 使用された単語の説明 */}
            {story.targetWords.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  このストーリーで使用された単語
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {story.targetWords.map((word) => (
                    <div
                      key={word.id}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <p className="font-semibold text-blue-900">{word.word}</p>
                      <p className="text-sm text-blue-700 mt-1">{word.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 単語追加確認ダイアログ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>単語を追加</DialogTitle>
            <DialogDescription>
              {clickedWordData && (
                <>
                  「<strong>{clickedWordData.word}</strong>」を苦手な単語リストに追加しますか？
                  {clickedWordData.meaning && (
                    <span className="block mt-2">
                      意味: {clickedWordData.meaning}
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleAddToMissedWords}
              className="bg-blue-600 hover:bg-blue-700"
            >
              追加する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

