"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search, CheckCircle2 } from "lucide-react";
import { useVocabulary } from "@/contexts/VocabularyContext";

export default function VocabularyPage() {
  const { missedWords, removeMissedWord } = useVocabulary();
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルター
  const filteredWords = missedWords.filter((word) =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLearned = (wordId: string) => {
    removeMissedWord(wordId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          苦手な単語帳
        </h1>
        <p className="text-gray-600">
          間違えた単語や覚えたい単語を管理します
        </p>
      </div>

      {/* 検索 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="単語を検索..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 単語リスト */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{item.word}</CardTitle>
                    <CardDescription className="text-base font-medium text-gray-700">
                      {item.meaning}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 italic border-l-4 border-blue-500 pl-3">
                  "{item.context}"
                </p>
                <Button
                  onClick={() => handleLearned(item.id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  覚えた！
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {searchQuery ? (
              <>
                <p className="text-gray-600 mb-2">検索結果が見つかりませんでした</p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                >
                  検索をクリア
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">まだ単語が登録されていません</p>
                <p className="text-sm text-gray-500 mb-4">
                  単語テストで間違えた単語が自動的に追加されます
                </p>
                <Button
                  onClick={() => window.location.href = "/quiz"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  単語テストを開始
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

