"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVocabulary, Word } from "@/contexts/VocabularyContext";
import { Sparkles, BookOpen } from "lucide-react";
import { mockGenerateStory, GeneratedStory } from "@/utils/storyGenerator";

const GENRES = [
  { value: "biography", label: "伝記" },
  { value: "academic", label: "論文" },
  { value: "fairyTale", label: "童話" },
  { value: "nonfiction", label: "ノンフィクション" },
  { value: "scienceFiction", label: "SF" },
];

export default function GeneratePage() {
  const router = useRouter();
  const { missedWords } = useVocabulary();
  const [selectedGenre, setSelectedGenre] = useState("biography");
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 最大5つの単語を自動選択（最初の5つ）
  useEffect(() => {
    if (missedWords.length > 0 && selectedWords.length === 0) {
      const autoSelected = missedWords.slice(0, Math.min(5, missedWords.length));
      setSelectedWords(autoSelected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missedWords]);

  const toggleWordSelection = (word: Word) => {
    if (selectedWords.some((w) => w.id === word.id)) {
      // 既に選択されている場合は削除
      setSelectedWords(selectedWords.filter((w) => w.id !== word.id));
    } else {
      // 最大5つまで選択可能
      if (selectedWords.length < 5) {
        setSelectedWords([...selectedWords, word]);
      }
    }
  };

  const handleGenerate = async () => {
    if (selectedWords.length === 0) {
      alert("少なくとも1つの単語を選択してください");
      return;
    }

    setIsGenerating(true);

    // ダミーストーリー生成（実際には非同期処理をシミュレート）
    setTimeout(() => {
      const story = mockGenerateStory({
        genre: selectedGenre,
        targetWords: selectedWords,
      });

      // localStorageにストーリーを保存
      if (typeof window !== "undefined") {
        localStorage.setItem("generated_story", JSON.stringify(story));
      }

      // リーダーページへ遷移
      router.push("/reader");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-green-600" />
          ストーリー生成
        </h1>
        <p className="text-gray-600">
          苦手な単語を含むストーリーを生成して、文脈で覚えましょう
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ストーリー設定</CardTitle>
          <CardDescription>
            ジャンルと使用する単語を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ジャンル選択 */}
          <div className="space-y-2">
            <Label htmlFor="genre">ジャンル</Label>
            <Select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <SelectValue placeholder="ジャンルを選択" />
              <SelectContent>
                {GENRES.map((genre) => (
                  <SelectItem key={genre.value} value={genre.value}>
                    {genre.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ターゲット単語選択 */}
          <div className="space-y-2">
            <Label>使用する単語（最大5つ）</Label>
            {missedWords.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    苦手な単語がまだ登録されていません
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    単語テストで間違えた単語が自動的に追加されます
                  </p>
                  <Button
                    onClick={() => router.push("/quiz")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    単語テストを開始
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  選択中: {selectedWords.length} / 5
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {missedWords.map((word) => {
                    const isSelected = selectedWords.some((w) => w.id === word.id);
                    return (
                      <button
                        key={word.id}
                        onClick={() => toggleWordSelection(word)}
                        disabled={!isSelected && selectedWords.length >= 5}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-green-500 bg-green-50"
                            : selectedWords.length >= 5
                            ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                            : "border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{word.word}</p>
                            <p className="text-sm text-gray-600 mt-1">{word.meaning}</p>
                          </div>
                          {isSelected && (
                            <div className="ml-2 text-green-600 font-bold">✓</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 生成ボタン */}
          <Button
            onClick={handleGenerate}
            disabled={selectedWords.length === 0 || isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                ストーリーを生成
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

