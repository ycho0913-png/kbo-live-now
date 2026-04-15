const DEFAULT_TIMEOUT_MS = 10000;

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

export const MOBILE_BROWSER_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36";

export async function fetchHtml(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(`HTML 요청 실패: ${response.status} ${response.statusText}`);
    }

    return response.text();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchFormJson<T>(
  url: string,
  body: URLSearchParams,
  init: RequestInit & { timeoutMs?: number; referer?: string; mobile?: boolean } = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      ...init,
      headers: {
        "User-Agent": init.mobile ? MOBILE_BROWSER_USER_AGENT : BROWSER_USER_AGENT,
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        ...(init.referer ? { Referer: init.referer } : {}),
        ...(init.headers ?? {})
      },
      body
    });

    if (!response.ok) {
      throw new Error(`JSON 요청 실패: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
