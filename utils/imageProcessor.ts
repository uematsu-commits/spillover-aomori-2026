/**
 * 画像処理ユーティリティ
 * Canvas APIを使用して画像のクロップと合成を行う
 */

/**
 * 画像を正方形にクロップ（短い辺に合わせて中央で切り抜き）
 * @param image クロップする画像要素
 * @returns クロップされた画像のImageData
 */
export function cropToSquare(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Canvas context could not be created");
  }

  const size = Math.min(image.width, image.height);
  canvas.width = size;
  canvas.height = size;

  // 中央でクロップ
  const sourceX = (image.width - size) / 2;
  const sourceY = (image.height - size) / 2;

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    size,
    size,
    0,
    0,
    size,
    size
  );

  return canvas;
}

/**
 * 画像をロードする
 * @param file 画像ファイル
 * @returns ロードされた画像要素
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    
    img.src = url;
  });
}

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WhiteRectOptions = {
  whiteThreshold?: number;
  downscaleMax?: number;
};

/**
 * テンプレート画像の中央の白枠を検出して座標を返す
 * @param templateImage テンプレート画像
 * @param options 検出パラメータ
 * @returns 白枠の座標とサイズ。検出できない場合はnull。
 */
export function detectWhiteSquareRect(
  templateImage: HTMLImageElement,
  options: WhiteRectOptions = {}
): Rect | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context could not be created");
  }

  const width = templateImage.width;
  const height = templateImage.height;
  const downscaleMax = options.downscaleMax ?? 512;

  const scale = Math.min(1, downscaleMax / Math.max(width, height));
  const scaledWidth = Math.max(1, Math.round(width * scale));
  const scaledHeight = Math.max(1, Math.round(height * scale));
  const scaleX = width / scaledWidth;
  const scaleY = height / scaledHeight;

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  ctx.drawImage(templateImage, 0, 0, scaledWidth, scaledHeight);

  const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
  const data = imageData.data;
  const whiteThreshold = options.whiteThreshold ?? 230;
  const total = scaledWidth * scaledHeight;
  const mask = new Uint8Array(total);
  const visited = new Uint8Array(total);

  for (let y = 0; y < scaledHeight; y++) {
    const rowOffset = y * scaledWidth * 4;
    for (let x = 0; x < scaledWidth; x++) {
      const i = rowOffset + x * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
        mask[y * scaledWidth + x] = 1;
      }
    }
  }

  let bestArea = 0;
  let bestMinX = 0;
  let bestMinY = 0;
  let bestMaxX = 0;
  let bestMaxY = 0;

  const queue = new Int32Array(total);
  for (let y = 0; y < scaledHeight; y++) {
    for (let x = 0; x < scaledWidth; x++) {
      const startIndex = y * scaledWidth + x;
      if (!mask[startIndex] || visited[startIndex]) continue;

      let head = 0;
      let tail = 0;
      queue[tail++] = startIndex;
      visited[startIndex] = 1;

      let area = 0;
      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;

      while (head < tail) {
        const index = queue[head++];
        const cy = Math.floor(index / scaledWidth);
        const cx = index - cy * scaledWidth;
        area += 1;

        if (cx < minX) minX = cx;
        if (cy < minY) minY = cy;
        if (cx > maxX) maxX = cx;
        if (cy > maxY) maxY = cy;

        if (cx > 0) {
          const leftIndex = index - 1;
          if (mask[leftIndex] && !visited[leftIndex]) {
            visited[leftIndex] = 1;
            queue[tail++] = leftIndex;
          }
        }
        if (cx < scaledWidth - 1) {
          const rightIndex = index + 1;
          if (mask[rightIndex] && !visited[rightIndex]) {
            visited[rightIndex] = 1;
            queue[tail++] = rightIndex;
          }
        }
        if (cy > 0) {
          const upIndex = index - scaledWidth;
          if (mask[upIndex] && !visited[upIndex]) {
            visited[upIndex] = 1;
            queue[tail++] = upIndex;
          }
        }
        if (cy < scaledHeight - 1) {
          const downIndex = index + scaledWidth;
          if (mask[downIndex] && !visited[downIndex]) {
            visited[downIndex] = 1;
            queue[tail++] = downIndex;
          }
        }
      }

      if (area > bestArea) {
        bestArea = area;
        bestMinX = minX;
        bestMinY = minY;
        bestMaxX = maxX;
        bestMaxY = maxY;
      }
    }
  }

  if (bestArea === 0) {
    return null;
  }

  const x = Math.round(bestMinX * scaleX);
  const y = Math.round(bestMinY * scaleY);
  const widthPx = Math.round((bestMaxX + 1) * scaleX - x);
  const heightPx = Math.round((bestMaxY + 1) * scaleY - y);

  return {
    x,
    y,
    width: widthPx,
    height: heightPx,
  };
}

/**
 * テンプレート画像とユーザー画像を合成
 * @param templateImage テンプレート画像
 * @param userImage ユーザー画像（正方形にクロップ済み）
 * @param cropX 白枠のX座標
 * @param cropY 白枠のY座標
 * @param cropWidth 白枠の幅
 * @param cropHeight 白枠の高さ
 * @returns 合成された画像のCanvas
 */
export function compositeImages(
  templateImage: HTMLImageElement,
  userImage: HTMLImageElement | HTMLCanvasElement,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Canvas context could not be created");
  }

  // テンプレート画像のサイズに合わせる
  canvas.width = templateImage.width;
  canvas.height = templateImage.height;

  // テンプレート画像を描画
  ctx.drawImage(templateImage, 0, 0);

  // ユーザー画像を白枠部分に合わせてリサイズして描画
  ctx.drawImage(
    userImage,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  );

  return canvas;
}

/**
 * CanvasをBlobに変換
 * @param canvas Canvas要素
 * @returns PNG形式のBlob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("画像の変換に失敗しました"));
        }
      },
      "image/png"
    );
  });
}

/**
 * 画像をダウンロード
 * @param canvas Canvas要素
 * @param filename ファイル名
 */
export function downloadImage(canvas: HTMLCanvasElement, filename: string = "spillover-aomori-2026.png"): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, "image/png");
}

