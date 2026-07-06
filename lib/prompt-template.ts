/**
 * LLMプロンプトテンプレート
 * 科目・章・自由記述を埋め込んで問題生成プロンプトを生成する
 */

export interface GenerateQuestionPromptParams {
  subject: string;
  chapter: string;
  freeText?: string;
  rejectedQuestions?: Array<{
    question_text: string;
  }>;
}

/**
 * 問題生成用のプロンプトを生成する
 */
export function generateQuestionPrompt(params: GenerateQuestionPromptParams): string {
  const { subject, chapter, freeText, rejectedQuestions } = params;

  let prompt = `あなたはIT資格試験の問題作成者です。
以下の条件に基づいて、1問の四択問題を作成してください。

【科目】${subject}
【章】${chapter}`;

  if (freeText && freeText.trim()) {
    prompt += `\n【追加要望】${freeText}`;
  }

  // 不採用問題を除外する制約を追加
  if (rejectedQuestions && rejectedQuestions.length > 0) {
    prompt += `\n\n【過去に不採用となった問題（これらと類似する問題は生成しないこと）】`;
    rejectedQuestions.forEach((rq, index) => {
      prompt += `\n${index + 1}. ${rq.question_text}`;
    });
  }

  prompt += `
【出力形式】
{
  "question": "問題文",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "answer": 正解番号（1〜4の整数）,
  "difficulty": 難易度（1〜5の整数）,
  "explanation": "解説文"
}

【絶対遵守ルール】
- 出力は JSON のみ。前後に文章・説明・挨拶・補足を一切付けない。
- 出力は必ずプレーンテキストで行うこと。
- コードブロック（\`\`\`python、\`\`\`json、\`\`\`text など）を絶対に使わない。
- JSON 内にもコードブロックを入れない（例：\`\`\`python ...\`\`\` を禁止）。
- Markdown記法（#, **, *, > , - など）を一切使わない。
- JSONのキーは必ずダブルクォートで囲む。
- JSONは必ず有効な構文で返す（最後のカンマ禁止）。
- 過去に不採用となった問題と同一内容を生成しないこと
- 解説は正解の理由を明確に説明すること。
- 正解番号は1〜4の整数で指定すること
- 難易度は1〜5の整数で指定すること（1:初級、5:上級）
- 解説は正解の理由を明確に説明すること
- 解説は適宜改行を入れて読みやすくすること
- 選択肢は明確に区別できるようにすること

## 出力の禁止事項
以下の形式を出力してはならない。

- Markdown の太字（例: **選択肢2**）
- Markdown の斜体（例: *選択肢2*）
- コードブロック（\`\`\`json や \`\`\`python など）
- 見出し記法（例: # 問題）

【重要】
次の行から JSON を開始し、JSON 以外の文字列を一切出力しないこと。
`;

  return prompt;
}

