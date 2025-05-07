// 型定義をインポート
import { Prefectures, QuizData, ErrorData, QuizStep } from "./types.ts";

// DOM要素の取得
const prefectures = document.getElementById(
  "prefectures"
) as HTMLSelectElement | null;
const questionText = document.querySelector(
  ".c_quiz__questionText"
) as HTMLElement | null;
const quizNote = document.querySelector(".c_quiz__note") as HTMLElement | null;
const quizList = document.querySelector(".c_quiz__list") as HTMLElement | null;
const quizCheck = document.querySelector(
  ".c_quiz__check"
) as HTMLButtonElement | null;
const quizRetry = document.querySelector(
  ".c_quiz__retry"
) as HTMLButtonElement | null;
const quizResult = document.querySelector(
  ".c_quiz__result"
) as HTMLOutputElement | null;

// 現在選択されている都道府県のデータ
let currentQuizEntry: Prefectures | null = null;

// クイズの進行状態を管理
const QUIZ_STATE = {
  FIRST: 0,
  FIRST_CHECK: 1,
  SECOND: 2,
  SECOND_CHECK: 3,
  FINISHED: 4,
};

// クイズの現在の状態
let quizState = 0;

// 表示用のデフォルトメッセージ
const DEFAULT_INTRO_TEXT = "都道府県を選ぶと、クイズが出てきます！";
const DEFAULT_START_TEXT = "答えを1つ選んでください";
const DEFAULT_RESULT_TEXT = "解答結果がここに表示されます";
const QUIZ_COMPLETION_MESSAGE =
  "クイズはおしまい！他の地域にも挑戦してみてね。";

// 選択された回答と、正誤判定結果
let selectedAnswer: string | undefined;
let answerIsCorrect: string | undefined;

// 「答え合わせ」ボタンの処理
if (quizCheck && quizResult && quizRetry && quizNote) {
  quizCheck.addEventListener("click", () => {
    quizResult.classList.add("has-answer");

    if (answerIsCorrect === undefined) {
      quizResult.textContent = DEFAULT_START_TEXT;
    } else {
      quizResult.textContent = `${answerIsCorrect}`;
      if (quizState === QUIZ_STATE.FIRST_CHECK) {
        quizCheck.disabled = true;
        quizRetry.disabled = false;
        quizState = QUIZ_STATE.SECOND;
      } else if (quizState === QUIZ_STATE.SECOND_CHECK) {
        quizCheck.disabled = true;
        quizRetry.disabled = true;
        quizNote.textContent = QUIZ_COMPLETION_MESSAGE;
      }
    }
    answerIsCorrect = undefined;
  });
}

// 「もう1問」ボタンの処理
if (quizCheck && quizResult && quizRetry && quizList) {
  quizRetry.addEventListener("click", () => {
    quizList.innerHTML = "";
    quizResult.classList.remove("has-answer");
    quizResult.textContent = DEFAULT_RESULT_TEXT;
    if (QUIZ_STATE.SECOND === quizState) {
      if (currentQuizEntry) createChoiceList(currentQuizEntry, quizState);
      quizState = QUIZ_STATE.SECOND_CHECK;
      addRadioEventListeners();
      quizCheck.disabled = false;
      quizRetry.disabled = true;
    }
  });
}

// クイズデータの取得
async function getQuizData(): Promise<QuizData | ErrorData> {
  try {
    const responseData = await fetch("/quiz.json");
    if (responseData.ok) {
      return await responseData.json();
    }
    throw new Error(`ステータスコード: ：${responseData.status}`);
  } catch (err) {
    console.error(err);
    return { error: "クイズデータの取得に失敗しました" };
  }
}

// クイズを表示・都道府県選択に反応
async function displayQuiz() {
  const quizData = await getQuizData();

  if (
    prefectures &&
    quizCheck &&
    quizResult &&
    quizRetry &&
    quizList &&
    quizNote &&
    questionText
  ) {
    prefectures.addEventListener("change", () => {
      quizResult.textContent = "";
      quizResult.classList.remove("has-answer");
      // データ取得に失敗していた場合
      if ("error" in quizData) {
        return;
      }

      // 選択された都道府県にクイズがあるか確認
      if (Object.hasOwn(quizData, prefectures.value)) {
        // ステートとUIを初期化
        quizList.innerHTML = "";
        quizState = QUIZ_STATE.FIRST;
        quizCheck.classList.remove("is-hidden");
        quizRetry.classList.remove("is-hidden");
        quizNote.classList.remove("is-hidden");
        quizCheck.disabled = false;

        // クイズデータを取得して出題
        const selectedPrefecture: QuizStep = quizData[prefectures.value];
        currentQuizEntry = new Prefectures(selectedPrefecture);
        createChoiceList(currentQuizEntry, quizState);
        quizState = QUIZ_STATE.FIRST_CHECK;
        quizResult.textContent = DEFAULT_RESULT_TEXT;
        quizNote.textContent = DEFAULT_START_TEXT;
        addRadioEventListeners();
      } else {
        // クイズデータがなかった場合のUI対応
        quizNote?.classList.add("is-hidden");
        quizCheck.classList.add("is-hidden");
        quizRetry.classList.add("is-hidden");
        quizList.innerHTML = "";
        questionText.textContent = DEFAULT_INTRO_TEXT;
      }
    });
  }
}

// 選択肢をHTML上に表示する
function createChoiceList(quizData: Prefectures, currentQuizState: number) {
  let choices: string[] = [];
  let question = "";

  // 出題内容を状態に応じて切り替え
  if (QUIZ_STATE.FIRST === currentQuizState) {
    choices = quizData.choicesS1;
    question = quizData.questionS1;
  } else if (QUIZ_STATE.SECOND === currentQuizState) {
    choices = quizData.choicesS2;
    question = quizData.questionS2;
  }
  // 質問文を表示
  if (questionText) {
    questionText.textContent = `${question}`;
  }
  // 選択肢をラジオボタンとして表示
  if (quizList) {
    quizList.innerHTML = "";
  }
  choices.forEach((choice) => {
    const label = document.createElement("label");
    label.classList.add("c_quiz__choice");
    label.textContent = `${choice}`;

    const input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "quiz");
    input.setAttribute("value", `${choice}`);
    const span = document.createElement("span");
    span.classList.add("c_quiz__circle");
    label.append(input, span);
    quizList?.append(label);
  });
}

// createChoiceList() が毎回ラジオを再生成するため、
// リスナーの多重登録は現状問題ない。
// 仕様変更時は注意。
function addRadioEventListeners() {
  const radios = document.querySelectorAll('input[name="quiz"]');
  radios.forEach((radio) => {
    radio.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLInputElement;
      selectedAnswer = target.value;
      if (currentQuizEntry) {
        answerIsCorrect = currentQuizEntry.isCorrectAnswer(
          selectedAnswer,
          quizState
        );
      }
    });
  });
}

export { displayQuiz };
