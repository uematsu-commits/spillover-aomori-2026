"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVocabulary, Word } from "@/contexts/VocabularyContext";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import wordsData from "@/data/words.json";

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

export default function QuizPage() {
  const router = useRouter();
  const { addMissedWord } = useVocabulary();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // クイズを初期化
  useEffect(() => {
    initializeQuiz();
  }, []);

  const initializeQuiz = () => {
    // 30個の単語からランダムに10個を選択
    const shuffled = [...wordsData].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 10);

    const quizQuestions: QuizQuestion[] = selectedWords.map((word) => {
      // 正解を含む4つの選択肢を生成
      const allMeanings = wordsData.map((w) => w.meaning);
      const wrongOptions = allMeanings
        .filter((m) => m !== word.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [word.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
      
      return {
        word,
        options,
        correctAnswer: word.meaning,
      };
    });

    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      // 間違えた場合はmissedWordsに追加
      addMissedWord(currentQuestion.word);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    initializeQuiz();
  };

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-gray-600">クイズを準備中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">クイズ完了！</CardTitle>
            <CardDescription className="text-lg">
              あなたのスコア
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl font-bold text-blue-600">
              {score} / {questions.length}
            </div>
            <div className="text-2xl text-gray-600">
              {Math.round((score / questions.length) * 100)}%
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleRestart}
                className="bg-blue-600 hover:bg-blue-700"
              >
                もう一度挑戦
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
              >
                ダッシュボードに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 進捗バー */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            問題 {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            スコア: {score} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mb-4">
            {currentQuestion.word.word}
          </CardTitle>
          <CardDescription className="text-base italic border-l-4 border-blue-500 pl-3">
            &quot;{currentQuestion.word.context}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium text-gray-700 mb-4">
            この単語の意味を選んでください：
          </p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
              
              if (isAnswered) {
                if (option === currentQuestion.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700 font-semibold";
                } else if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                }
              } else {
                buttonClass += "border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isAnswered && option === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6 pt-6 border-t">
              <div className={`p-4 rounded-lg mb-4 ${
                isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}>
                <p className={`font-semibold ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}>
                  {isCorrect ? "✓ 正解です！" : "✗ 不正解です"}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-gray-600 mt-2">
                    正解: {currentQuestion.correctAnswer}
                  </p>
                )}
                {!isCorrect && (
                  <p className="text-sm text-gray-600 mt-1">
                    この単語は苦手な単語リストに追加されました。
                  </p>
                )}
              </div>
              <Button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                次へ
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



