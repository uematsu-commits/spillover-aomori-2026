"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Word {
  id: string;
  word: string;
  meaning: string;
  context: string;
}

interface VocabularyContextType {
  missedWords: Word[];
  userLevel: string;
  addMissedWord: (word: Word) => void;
  removeMissedWord: (wordId: string) => void;
  setUserLevel: (level: string) => void;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MISSED_WORDS: "vocabulary_missed_words",
  USER_LEVEL: "vocabulary_user_level",
};

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const [missedWords, setMissedWords] = useState<Word[]>([]);
  const [userLevel, setUserLevelState] = useState<string>("600");
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorageからデータを読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedWords = localStorage.getItem(STORAGE_KEYS.MISSED_WORDS);
        const storedLevel = localStorage.getItem(STORAGE_KEYS.USER_LEVEL);

        if (storedWords) {
          setMissedWords(JSON.parse(storedWords));
        }
        if (storedLevel) {
          setUserLevelState(storedLevel);
        }
      } catch (error) {
        console.error("Failed to load data from localStorage:", error);
      }
      setIsLoaded(true);
    }
  }, []);

  // missedWordsが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.MISSED_WORDS, JSON.stringify(missedWords));
      } catch (error) {
        console.error("Failed to save missedWords to localStorage:", error);
      }
    }
  }, [missedWords, isLoaded]);

  // userLevelが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_LEVEL, userLevel);
      } catch (error) {
        console.error("Failed to save userLevel to localStorage:", error);
      }
    }
  }, [userLevel, isLoaded]);

  const addMissedWord = (word: Word) => {
    setMissedWords((prev) => {
      // 既に存在する場合は追加しない
      if (prev.some((w) => w.id === word.id)) {
        return prev;
      }
      return [...prev, word];
    });
  };

  const removeMissedWord = (wordId: string) => {
    setMissedWords((prev) => prev.filter((w) => w.id !== wordId));
  };

  const setUserLevel = (level: string) => {
    setUserLevelState(level);
  };

  return (
    <VocabularyContext.Provider
      value={{
        missedWords,
        userLevel,
        addMissedWord,
        removeMissedWord,
        setUserLevel,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error("useVocabulary must be used within a VocabularyProvider");
  }
  return context;
}



