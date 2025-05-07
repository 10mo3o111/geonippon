export interface PrefectureRegions {
  [key: string]: string[];
}

export interface QuizStep {
  step1: QuizDataForPref;
  step2: QuizDataForPref;
}

interface QuizDataForPref {
  question: string;
  choices: string[];
  answer: string;
}

export interface QuizData {
  [preName: string]: QuizStep;
}

export interface ErrorData {
  error: string;
}

// 都道府県ごとのクイズ情報を管理するクラス
export class Prefectures {
  // 第1問のData
  #questionS1: string;
  #choicesS1: string[];
  #answerS1: string;

  // 第2問のData
  #questionS2: string;
  #choicesS2: string[];
  #answerS2: string;

  constructor(steps: QuizStep) {
    this.#questionS1 = steps.step1.question;
    this.#choicesS1 = steps.step1.choices;
    this.#answerS1 = steps.step1.answer;
    this.#questionS2 = steps.step2.question;
    this.#choicesS2 = steps.step2.choices;
    this.#answerS2 = steps.step2.answer;
  }

  get questionS1() {
    return this.#questionS1;
  }
  get choicesS1() {
    return this.#choicesS1;
  }
  get answerS1() {
    return this.#answerS1;
  }

  get questionS2() {
    return this.#questionS2;
  }
  get choicesS2() {
    return this.#choicesS2;
  }
  get answerS2() {
    return this.#answerS2;
  }
  static readonly STATUS = {
    FIRST_CHECK: 1,
    SECOND_CHECK: 3,
  };

  isCorrectAnswer(selectedAnswer: string, status: number) {
    if (status === Prefectures.STATUS.FIRST_CHECK) {
      return this.#answerS1 === selectedAnswer ? "正解" : "不正解";
    }
    if (status === Prefectures.STATUS.SECOND_CHECK) {
      return this.#answerS2 === selectedAnswer ? "正解" : "不正解";
    }
  }
}
