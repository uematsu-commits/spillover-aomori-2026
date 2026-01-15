"use client";

import Link from "next/link";
import { BookOpen, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVocabulary } from "@/contexts/VocabularyContext";

export default function Dashboard() {
  const { missedWords, userLevel } = useVocabulary();
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          英語学習ダッシュボード
        </h1>
        <p className="text-gray-600">
          苦手な単語を文脈で覚えて、英語力を向上させましょう
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">現在のレベル</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">TOEIC {userLevel}点</div>
            <p className="text-xs text-muted-foreground mt-1">
              目標: TOEIC {parseInt(userLevel) < 800 ? "800" : "900"}点
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学習した単語</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">24</div>
            <p className="text-xs text-muted-foreground mt-1">
              今週 +5 単語
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">苦手な単語</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{missedWords.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {missedWords.length > 0 ? "復習が必要" : "すべて覚えました！"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* アクションカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/quiz">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                単語テスト
              </CardTitle>
              <CardDescription>
                苦手な単語をテストして、記憶を定着させましょう
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                テストを開始
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/generate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                ストーリー生成
              </CardTitle>
              <CardDescription>
                AIが苦手な単語を使ったストーリーを生成します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                ストーリーを生成
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* 最近の学習履歴 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>最近の学習履歴</CardTitle>
          <CardDescription>あなたの学習の進捗状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">単語テスト</p>
                <p className="text-sm text-gray-600">2024年3月15日</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">8/10 正解</p>
                <p className="text-sm text-gray-600">80%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">ストーリー学習</p>
                <p className="text-sm text-gray-600">2024年3月14日</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">5単語学習</p>
                <p className="text-sm text-gray-600">良好</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
