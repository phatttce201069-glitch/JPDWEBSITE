import type { ExamQuestion } from "./exam.ts";
import { getQuestionExplanation } from "./explanation.ts";

export type SkillCategory = "Kanji" | "Từ vựng" | "Ngữ pháp";

export type MistakeItem = {
  questionId: string;
  question: ExamQuestion;
  userAnswer: string | null;
  category: SkillCategory;
  specificIssue: string;
  lessonId: string;
  lessonTitle: string;
  pointTitle?: string;
  recommendedAction: string;
  actionUrl: string;
};

export type SkillDiagnostic = {
  category: SkillCategory;
  total: number;
  correct: number;
  accuracy: number; // 0 - 100%
  status: "strong" | "moderate" | "weak";
  summary: string;
};

export type ImprovementTopic = {
  topicKey: string;
  lessonId: string;
  title: string;
  category: SkillCategory;
  mistakeCount: number;
  priority: "high" | "medium" | "low";
  actionLabel: string;
  actionUrl: string;
  detail: string;
};

export type ExamDiagnosticReport = {
  total: number;
  correct: number;
  incorrect: number;
  score10: number; // Thang điểm 10 (chuẩn FPT)
  passed: boolean; // Điểm >= 5.0
  accuracy: number; // %
  skills: Record<SkillCategory, SkillDiagnostic>;
  mistakes: MistakeItem[];
  improvementRoadmap: ImprovementTopic[];
  aiSenseiAdvice: {
    title: string;
    level: "distinction" | "credit" | "pass" | "retake";
    generalFeedback: string;
    urgentFocus: string;
    examTip: string;
  };
};

/**
 * Trích xuất mã số bài học từ chuỗi lesson (Ví dụ: "JPD123 - Bài 6 (So sánh...)" ➔ "6")
 */
function extractLessonId(lessonStr?: string): string {
  if (!lessonStr) return "1";
  const match = lessonStr.match(/Bài\s*(\d+)/i);
  return match ? match[1] : "1";
}

/**
 * Phân tích hiệu suất làm bài và chẩn đoán chi tiết từng điểm yếu cần cải thiện
 */
export function analyzeExamPerformance(
  paper: ExamQuestion[],
  answers: (string | null)[],
): ExamDiagnosticReport {
  const total = paper.length;
  let correct = 0;
  const mistakes: MistakeItem[] = [];

  const skillCounts: Record<SkillCategory, { total: number; correct: number }> = {
    Kanji: { total: 0, correct: 0 },
    "Từ vựng": { total: 0, correct: 0 },
    "Ngữ pháp": { total: 0, correct: 0 },
  };

  paper.forEach((q, idx) => {
    const userAnswer = answers[idx] ?? null;
    const isCorrect = userAnswer === q.answer;
    const cat = (q.section === "Kanji" || q.section === "Ngữ pháp" ? q.section : "Từ vựng") as SkillCategory;

    skillCounts[cat].total += 1;
    if (isCorrect) {
      skillCounts[cat].correct += 1;
      correct += 1;
    } else {
      const exp = getQuestionExplanation(q);
      const lessonId = extractLessonId(exp.lesson);
      const lessonTitle = exp.lesson || `Bài ${lessonId}`;

      let specificIssue = "Sai ngữ cảnh hoặc chưa nhớ kiến thức";
      let recommendedAction = `Ôn lại kiến thức Bài ${lessonId}`;
      let actionUrl = `/grammar?lesson=${lessonId}`;

      if (cat === "Kanji") {
        actionUrl = `/kana?script=kanji&row=Bài ${lessonId}`;
        if (q.prompt.includes("cách đọc") || q.prompt.includes("読み方")) {
          specificIssue = "Nhầm cách đọc Hiragana / Trường âm hoặc âm đục";
          recommendedAction = `Luyện cách đọc âm On & Kun của Kanji Bài ${lessonId}`;
        } else {
          specificIssue = "Nhận diện sai chữ Hán hoặc nhầm bộ thủ tương tự";
          recommendedAction = `Luyện nhận diện chữ và phân tích bộ thủ Kanji Bài ${lessonId}`;
        }
      } else if (cat === "Ngữ pháp") {
        actionUrl = `/grammar?lesson=${lessonId}`;
        if (q.sentence.includes("（　）") || q.sentence.includes("（ ）")) {
          if (/[でにをへがとはよりほどからまで]/.test(q.answer)) {
            specificIssue = `Nhầm lẫn chức năng trợ từ「${q.answer}」trong mẫu câu`;
            recommendedAction = `Ôn lại bảng cách dùng trợ từ của Bài ${lessonId}`;
          } else if (q.answer.includes("て") || q.answer.includes("で")) {
            specificIssue = "Sai quy tắc chia động từ thể て hoặc mẫu Vてください/Vています";
            recommendedAction = `Luyện chia động từ thể て của Bài ${lessonId}`;
          } else {
            specificIssue = exp.grammar || "Sai dạng chia ngữ pháp trong câu";
            recommendedAction = `Ôn lại mẫu câu: ${exp.grammar || `Bài ${lessonId}`}`;
          }
        }
      } else {
        // Từ vựng
        actionUrl = `/words?lesson=Bài ${lessonId}`;
        specificIssue = `Dùng sai từ vựng ngữ cảnh (Đáp án đúng là "${q.answer}")`;
        recommendedAction = `Tra cứu và học lại danh sách từ vựng Bài ${lessonId}`;
      }

      mistakes.push({
        questionId: q.id,
        question: q,
        userAnswer,
        category: cat,
        specificIssue,
        lessonId,
        lessonTitle,
        pointTitle: exp.grammar,
        recommendedAction,
        actionUrl,
      });
    }
  });

  const incorrect = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const score10 = Math.round((accuracy / 10) * 10) / 10;
  const passed = score10 >= 5.0;

  // 1. Chẩn đoán từng kỹ năng
  const skills: Record<SkillCategory, SkillDiagnostic> = {
    Kanji: buildSkillDiagnostic("Kanji", skillCounts.Kanji.total, skillCounts.Kanji.correct),
    "Từ vựng": buildSkillDiagnostic("Từ vựng", skillCounts["Từ vựng"].total, skillCounts["Từ vựng"].correct),
    "Ngữ pháp": buildSkillDiagnostic("Ngữ pháp", skillCounts["Ngữ pháp"].total, skillCounts["Ngữ pháp"].correct),
  };

  // 2. Gom nhóm các điểm cần cải thiện (Improvement Roadmap)
  const topicMap = new Map<string, ImprovementTopic>();

  for (const m of mistakes) {
    const key = `${m.category}-${m.lessonId}`;
    const existing = topicMap.get(key);
    if (existing) {
      existing.mistakeCount += 1;
      if (existing.mistakeCount >= 3) existing.priority = "high";
      else if (existing.mistakeCount === 2) existing.priority = "medium";
    } else {
      let actionLabel = "";
      if (m.category === "Kanji") actionLabel = `Luyện Kanji Bài ${m.lessonId}`;
      else if (m.category === "Ngữ pháp") actionLabel = `Học Ngữ pháp Bài ${m.lessonId}`;
      else actionLabel = `Ôn Từ vựng Bài ${m.lessonId}`;

      topicMap.set(key, {
        topicKey: key,
        lessonId: m.lessonId,
        title: `${m.category} · Bài ${m.lessonId}`,
        category: m.category,
        mistakeCount: 1,
        priority: "low",
        actionLabel,
        actionUrl: m.actionUrl,
        detail: m.pointTitle ? `Trọng tâm: ${m.pointTitle}` : m.specificIssue,
      });
    }
  }

  // Sắp xếp Roadmap theo mức độ ưu tiên từ cao xuống thấp
  const priorityScore = { high: 3, medium: 2, low: 1 };
  const improvementRoadmap = Array.from(topicMap.values()).sort(
    (a, b) => priorityScore[b.priority] - priorityScore[a.priority] || b.mistakeCount - a.mistakeCount,
  );

  // 3. Đưa ra lời khuyên từ Giảng viên AI FPT
  const aiSenseiAdvice = buildSenseiAdvice(score10, skills, improvementRoadmap);

  return {
    total,
    correct,
    incorrect,
    score10,
    passed,
    accuracy,
    skills,
    mistakes,
    improvementRoadmap,
    aiSenseiAdvice,
  };
}

function buildSkillDiagnostic(
  category: SkillCategory,
  total: number,
  correct: number,
): SkillDiagnostic {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  let status: "strong" | "moderate" | "weak" = "strong";
  let summary = "";

  if (accuracy >= 80) {
    status = "strong";
    summary =
      category === "Kanji"
        ? "Nắm rất vững mặt chữ và âm đọc Hiragana của các bài học."
        : category === "Ngữ pháp"
          ? "Phản xạ trợ từ và chia dạng thức câu rất chuẩn xác."
          : "Vốn từ vựng phong phú, nắm chắc ngữ cảnh giao tiếp.";
  } else if (accuracy >= 50) {
    status = "moderate";
    summary =
      category === "Kanji"
        ? "Cần cẩn thận hơn về quy tắc trường âm và các chữ có bộ thủ gần giống nhau."
        : category === "Ngữ pháp"
          ? "Cần củng cố thêm một số trợ từ đặc biệt (で/に/より/ほど) và chia thể động từ."
          : "Có một số từ vựng chưa phân biệt rõ ngữ cảnh, cần ôn lại flashcard.";
  } else {
    status = "weak";
    summary =
      category === "Kanji"
        ? "Lỗ hổng lớn về Hán tự! Cần tập trung luyện bộ thủ và âm Hán Việt gấp."
        : category === "Ngữ pháp"
          ? "Kỹ năng yếu nhất trong bài! Thường xuyên nhầm trợ từ và thể ngữ pháp."
          : "Thiếu từ vựng cơ bản, cần học lại toàn bộ từ vựng các bài có câu sai.";
  }

  return {
    category,
    total,
    correct,
    accuracy,
    status,
    summary,
  };
}

function buildSenseiAdvice(
  score10: number,
  skills: Record<SkillCategory, SkillDiagnostic>,
  roadmap: ImprovementTopic[],
): ExamDiagnosticReport["aiSenseiAdvice"] {
  // Tìm kỹ năng có tỉ lệ chính xác thấp nhất
  const weakestSkill = Object.values(skills).sort((a, b) => a.accuracy - b.accuracy)[0];

  if (score10 >= 9.0) {
    return {
      title: "Xuất sắc! Phong độ điểm A/A+ của Đại học FPT",
      level: "distinction",
      generalFeedback:
        "Bạn đã thể hiện trình độ vượt trội, xử lý mượt mà cả 3 phần Kanji, Từ vựng và Ngữ pháp. Kiến thức của bạn hoàn toàn sẵn sàng cho kỳ thi kết thúc môn Final Exam!",
      urgentFocus:
        roadmap.length > 0
          ? `Chỉ cần rà soát lại một vài chi tiết nhỏ ở ${roadmap[0].title}.`
          : "Duy trì phong độ bằng cách luyện thêm đề AI ngẫu nhiên.",
      examTip:
        "Trong phòng thi thật, hãy dành 5 phút cuối để kiểm tra lại các câu có trường âm và các câu rủ rê/từ chối khéo để tránh mất điểm đáng tiếc.",
    };
  }

  if (score10 >= 7.0) {
    return {
      title: "Khá tốt! Đã nắm vững kiến thức cốt lõi",
      level: "credit",
      generalFeedback:
        "Bạn đã đạt mức điểm an toàn và nắm chắc phần lớn giáo trình. Tuy nhiên vẫn còn một số bẫy trắc nghiệm nhỏ cần lưu ý để vươn lên mốc điểm Giỏi.",
      urgentFocus: `Tập trung nâng cao phần [${weakestSkill.category}] (${weakestSkill.accuracy}% chính xác), đặc biệt là ${roadmap[0]?.title || "các câu đã chọn nhầm"}.`,
      examTip:
        "Đề thi FPT rất hay gài bẫy về trợ từ (で diễn ra sự kiện vs に tồn tại) và các từ chối khéo (〜はちょっと… / やくそくがありますから). Hãy bấm vào lộ trình cải thiện bên dưới để ôn đúng trọng tâm.",
    };
  }

  if (score10 >= 5.0) {
    return {
      title: "Đạt chuẩn qua môn, nhưng chưa an toàn!",
      level: "pass",
      generalFeedback:
        "Bạn đã vượt qua mốc điểm liệt (5.0), nhưng mức độ dao động còn cao. Nếu gặp đề thi thật có độ biến hóa lớn, bạn có thể rơi vào vùng nguy hiểm.",
      urgentFocus: `Báo động ở kỹ năng [${weakestSkill.category}] (chỉ đạt ${weakestSkill.accuracy}%). Bạn cần hoàn thành các bài học trong Kế hoạch cải thiện ngay hôm nay.`,
      examTip:
        "Hãy luyện riêng từng phần bằng chức năng 'Luyện riêng phần' trong mục Ngữ pháp và học thuộc lòng 23 động từ chia thể て.",
    };
  }

  return {
    title: "Cảnh báo nguy cơ học lại / thi lại!",
    level: "retake",
    generalFeedback:
      "Kết quả hiện tại chưa đạt chuẩn tối thiểu (5.0/10). Bạn đang gặp khó khăn ở nhiều mảng kiến thức từ Kanji đến Ngữ pháp của môn học.",
    urgentFocus: `Ngay lập tức thực hiện lần lượt các mục trong 'Kế hoạch cải thiện ưu tiên cao' bên dưới, bắt đầu từ [${weakestSkill.category}].`,
    examTip:
      "Đừng nản lòng! Hãy chuyển sang chế độ học Chữ Hán kèm mẹo hình tượng và luyện đề rút gọn từng bài một (Bài 4, Bài 5...) trước khi làm đề tổng hợp 30 câu.",
  };
}
