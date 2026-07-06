/**
 * 問題文を正規化する関数
 * 空白除去・句読点統一などを行い、重複チェック用の標準形式を返す
 */
export function normalizeQuestionText(text: string): string {
  return text
    // 全角スペースを半角スペースに変換
    .replace(/\u3000/g, ' ')
    // 連続するスペースを1つにまとめる
    .replace(/\s+/g, ' ')
    // 前後の空白を除去
    .trim()
    // 句読点の統一（、。を，．に統一、またはその逆）
    // ここでは日本語の句読点を統一
    .replace(/，/g, '、')
    .replace(/．/g, '。')
    // 半角カンマ・ピリオドを全角に統一
    .replace(/,/g, '、')
    .replace(/\./g, '。');
}

/**
 * 文字列の類似度を簡易判定する関数
 * 完全一致だけでなく、部分的な一致も検出可能にする
 */
export function isSimilarText(text1: string, text2: string, threshold: number = 0.9): boolean {
  const normalized1 = normalizeQuestionText(text1);
  const normalized2 = normalizeQuestionText(text2);

  // 完全一致
  if (normalized1 === normalized2) {
    return true;
  }

  // レーベンシュタイン距離による類似度計算
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold;
}

/**
 * レーベンシュタイン距離を計算する関数
 * 2つの文字列間の編集距離を返す
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 削除
          dp[i][j - 1] + 1,     // 挿入
          dp[i - 1][j - 1] + 1  // 置換
        );
      }
    }
  }

  return dp[m][n];
}
