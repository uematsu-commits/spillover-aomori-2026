"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Key, Target } from "lucide-react";
import { useVocabulary } from "@/contexts/VocabularyContext";

export default function SettingsPage() {
  const { userLevel, setUserLevel } = useVocabulary();
  const [apiKey, setApiKey] = useState("");
  const [levelValue, setLevelValue] = useState(userLevel);
  const [levelSaveMessage, setLevelSaveMessage] = useState("");
  const [apiKeySaveMessage, setApiKeySaveMessage] = useState("");

  // 既存のAPIキーを読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("openai_api_key");
      if (stored) {
        setApiKey(stored);
      }
    }
  }, []);

  // userLevelが変更されたらlevelValueを更新
  useEffect(() => {
    setLevelValue(userLevel);
  }, [userLevel]);

  const handleLevelSave = () => {
    setUserLevel(levelValue);
    setLevelSaveMessage("レベルを保存しました");
    setTimeout(() => setLevelSaveMessage(""), 3000);
  };

  const handleApiKeySave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("openai_api_key", apiKey);
      setApiKeySaveMessage("APIキーを保存しました");
      setTimeout(() => setApiKeySaveMessage(""), 3000);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          設定
        </h1>
        <p className="text-gray-600">
          アプリの設定を管理します
        </p>
      </div>

      {/* 英語レベル設定 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            英語レベル設定
          </CardTitle>
          <CardDescription>
            あなたの現在の英語レベルを設定してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level">TOEICスコア</Label>
            <Select
              id="level"
              value={levelValue}
              onChange={(e) => setLevelValue(e.target.value)}
            >
              <SelectValue placeholder="レベルを選択" />
              <SelectContent>
                <SelectItem value="400">TOEIC 400点</SelectItem>
                <SelectItem value="500">TOEIC 500点</SelectItem>
                <SelectItem value="600">TOEIC 600点</SelectItem>
                <SelectItem value="700">TOEIC 700点</SelectItem>
                <SelectItem value="800">TOEIC 800点</SelectItem>
                <SelectItem value="900">TOEIC 900点</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleLevelSave}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              レベルを保存
            </Button>
            {levelSaveMessage && (
              <span className="text-sm text-green-600">{levelSaveMessage}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* APIキー設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-green-600" />
            OpenAI APIキー
          </CardTitle>
          <CardDescription>
            AIストーリー生成機能を使用するために、OpenAI APIキーを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">APIキー</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              className="font-mono"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              APIキーはローカルに保存され、サーバーには送信されません
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleApiKeySave}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            >
              APIキーを保存
            </Button>
            {apiKeySaveMessage && (
              <span className="text-sm text-green-600">{apiKeySaveMessage}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

