"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2, Image as ImageIcon } from "lucide-react";
import {
  loadImage,
  cropToSquare,
  compositeImages,
  downloadImage,
  detectWhiteSquareRect,
} from "@/utils/imageProcessor";

// テンプレート画像の白枠部分の座標とサイズ
const CROP_X = 273;
const CROP_Y = 218;
const CROP_WIDTH = 478;
const CROP_HEIGHT = 420;

export default function SpilloverPage() {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compositeCanvas, setCompositeCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // テンプレート画像をロード
  const loadTemplateImage = useCallback((): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("テンプレート画像の読み込みに失敗しました"));
      img.src = "/template.png";
    });
  }, []);

  // 画像処理を実行
  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // ユーザー画像をロード
      const userImg = await loadImage(file);

      // テンプレート画像をロード
      const templateImg = await loadTemplateImage();

      const detectedRect = detectWhiteSquareRect(templateImg);
      const cropRect = detectedRect ?? {
        x: CROP_X,
        y: CROP_Y,
        width: CROP_WIDTH,
        height: CROP_HEIGHT,
      };

      // ユーザー画像を正方形にクロップ
      const croppedCanvas = cropToSquare(userImg);

      // 画像を合成
      const composite = compositeImages(
        templateImg,
        croppedCanvas,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height
      );

      // プレビュー用のURLを生成
      const previewUrl = composite.toDataURL("image/png");
      setPreviewUrl(previewUrl);
      setCompositeCanvas(composite);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "画像処理中にエラーが発生しました";
      setError(errorMessage);
      console.error("Image processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [loadTemplateImage]);

  // ファイル選択ハンドラ
  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("画像ファイルを選択してください");
        return;
      }

      setUserImage(file);
      processImage(file);
    },
    [processImage]
  );

  // ファイル入力変更ハンドラ
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // ドラッグ&ドロップハンドラ
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0] || null;
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // ダウンロードハンドラ
  const handleDownload = useCallback(() => {
    if (compositeCanvas) {
      downloadImage(compositeCanvas, "spillover-aomori-2026.png");
    }
  }, [compositeCanvas]);

  // リセットハンドラ
  const handleReset = useCallback(() => {
    setUserImage(null);
    setPreviewUrl(null);
    setCompositeCanvas(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          SPILLOVER in Aomori 2026
        </h1>
        <p className="text-gray-600 text-lg">
          参加表明画像を生成
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アップロードセクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              画像をアップロード
            </CardTitle>
            <CardDescription>
              あなたの画像をアップロードしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ドラッグ&ドロップエリア */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }
                ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}
              `}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isProcessing}
              />
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  <p className="text-gray-600 font-medium">生成中...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-gray-700 font-medium mb-1">
                      クリックまたはドラッグ&ドロップ
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF など
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* リセットボタン */}
            {userImage && !isProcessing && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                別の画像を選択
              </Button>
            )}
          </CardContent>
        </Card>

        {/* プレビューセクション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              プレビュー
            </CardTitle>
            <CardDescription>
              生成された画像を確認できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="生成された画像"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  画像を保存する
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  画像をアップロードすると、<br />
                  ここにプレビューが表示されます
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 使い方説明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使い方</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>左側のエリアに画像をドラッグ&ドロップするか、クリックしてファイルを選択してください</li>
            <li>アップロードされた画像は自動的に正方形に切り抜かれ、テンプレートに合成されます</li>
            <li>右側のプレビューで結果を確認できます</li>
            <li>「画像を保存する」ボタンをクリックして、完成した画像をダウンロードしてください</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

