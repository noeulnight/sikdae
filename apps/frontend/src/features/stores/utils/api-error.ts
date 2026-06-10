import { isAxiosError } from "axios";

export function getStoreRequestErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 400) {
    return "요청 조건을 확인하세요.";
  }

  if (error.response?.status && error.response.status >= 500) {
    return "서버에서 매장 정보를 불러오지 못했습니다.";
  }

  return fallback;
}
