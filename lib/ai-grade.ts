import Groq from "groq-sdk";
import { generateGradeAnswerPrompt } from "@/lib/prompt-template";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * コードブロックからコンテンツを抽出する関数
 * ```json, ```python, ``` の各パターンに対応
 */
function extractCodeBlock(content: string): string {
  // 優先順位: json → python → 汎用コードブロック
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/g,
    /```python\s*([\s\S]*?)\s*```/g,
    /```\s*([\s\S]*?)\s*```/g
  ];

  for (const pattern of patterns) {
    content = content.replace(pattern, (_, code) => {
      // コードブロックの中身だけ取り出し
      const inner = code.trim();

      // 実際の改行を \n にエスケープ
      const escaped = inner.replace(/\n/g, "\\n");

      return escaped;
    });
  }

  return content.trim();
}

export async function gradeAnswerWithAI(params: {
  questionText: string;
  correctAnswer: string;
  userAnswer: string;
  acceptableAnswers?: string[];
}): Promise<{ isCorrect: boolean; confidence?: number; reasoning?: string }> {
  try {
    const { questionText, correctAnswer, userAnswer, acceptableAnswers } = params;

    // バリデーション
    if (!questionText || !correctAnswer || !userAnswer) {
      throw new Error("問題文、正解、ユーザーの回答は必須です");
    }

    // プロンプトを生成
    const prompt = generateGradeAnswerPrompt({
      questionText,
      correctAnswer,
      userAnswer,
      acceptableAnswers,
    });

    // LLMを呼び出し
    const res = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // 判定は低めの温度で安定させる
    });

    const content = res.choices[0].message.content;

    if (!content) {
      throw new Error("回答の判定に失敗しました");
    }

    // JSONをパース
    let parsedResult;
    try {
      // コードブロックからコンテンツを抽出
      const jsonStr = extractCodeBlock(content);
      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e);
      throw new Error("判定結果の解析に失敗しました");
    }

    // バリデーション
    if (typeof parsedResult.isCorrect !== "boolean") {
      throw new Error("判定結果の形式が正しくありません");
    }

    return {
      isCorrect: parsedResult.isCorrect,
      confidence: parsedResult.confidence || 0.5,
      reasoning: parsedResult.reasoning || "",
    };
  } catch (error) {
    console.error("Error grading answer:", error);
    throw new Error(`AI判定に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}
