const KEY = "rus-tili-mistakes";

function load(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "number") : [];
  } catch {
    return [];
  }
}

function save(ids: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // localStorage mavjud emas — e'tibor bermaymiz
  }
}

export function getMistakeIds(): number[] {
  return load();
}

export function addMistake(wordId: number) {
  const ids = load();
  if (!ids.includes(wordId)) {
    ids.push(wordId);
    save(ids);
  }
}

export function removeMistake(wordId: number) {
  const ids = load();
  if (ids.includes(wordId)) {
    save(ids.filter((id) => id !== wordId));
  }
}
