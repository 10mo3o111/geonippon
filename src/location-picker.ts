import { PrefectureRegions } from "./types";

const prefectures = document.getElementById("prefectures") as HTMLSelectElement;

const regionContainer = document.querySelector(
  ".c_region__container"
) as HTMLElement;

const municipalityContainer = document.getElementById(
  "municipality-container"
) as HTMLElement;

const municipality = document.getElementById(
  "municipality"
) as HTMLSelectElement;

async function getPrefs(): Promise<PrefectureRegions> {
  try {
    const prefsResponse = await fetch(
      "https://geolonia.github.io/japanese-addresses/api/ja.json"
    );
    if (prefsResponse.ok) {
      return await prefsResponse.json();
    }
    throw new Error(`エラーが発生しました。code: ${prefsResponse.status}`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err);
      if (regionContainer) {
        regionContainer.classList.add("error-message");
        regionContainer.textContent = `都道府県の情報を取得できませんでした。しばらくしてからもう一度お試しください。`;
      }
    }
    return {};
  }
}

async function displayPrefs() {
  const results: PrefectureRegions = await getPrefs();
  Object.keys(results).forEach((result) => {
    const option = document.createElement("option");
    option.value = result;
    option.textContent = result;
    prefectures?.append(option);
  });

  prefectures?.addEventListener("change", () => {
    municipality.innerHTML = "";
    municipalityContainer.style.display = "none";

    if (prefectures.value !== "") {
      municipalityContainer.style.display = "block";
      results[prefectures.value]?.forEach((v: string) => {
        const option = document.createElement("option");
        option.value = v;
        option.textContent = v;
        municipality.append(option);
      });
    }
  });
}

export { displayPrefs };
