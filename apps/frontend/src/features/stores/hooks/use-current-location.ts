import { useCallback, useEffect, useState } from "react";
import type { StoreLocation } from "../types/store";

export type CurrentLocationResult = {
  errorMessage?: string;
  location: null | StoreLocation;
};

const LOCATION_ERROR_MESSAGE = "현재 위치 권한을 허용한 뒤 다시 시도하세요.";
const LOCATION_UNSUPPORTED_MESSAGE = "현재 브라우저에서 위치 정보를 사용할 수 없습니다.";

export function useCurrentLocation(enabled = false) {
  const [location, setLocation] = useState<null | StoreLocation>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = useCallback(async (): Promise<CurrentLocationResult> => {
    setIsLocating(true);
    setErrorMessage(undefined);

    const result = await requestCurrentLocation();

    setLocation(result.location);
    setErrorMessage(result.errorMessage);
    setIsLocating(false);

    return result;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLocating(false);
      return;
    }

    let cancelled = false;

    async function resolveLocation() {
      setIsLocating(true);
      setErrorMessage(undefined);

      const result = await requestCurrentLocation();

      if (!cancelled) {
        setLocation(result.location);
        setErrorMessage(result.errorMessage);
        setIsLocating(false);
      }
    }

    void resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    errorMessage,
    isLocating,
    location,
    requestLocation,
  };
}

export async function requestCurrentLocation(): Promise<CurrentLocationResult> {
  if (
    typeof navigator === "undefined" ||
    !("geolocation" in navigator) ||
    (typeof window !== "undefined" && !window.isSecureContext)
  ) {
    return {
      errorMessage: LOCATION_UNSUPPORTED_MESSAGE,
      location: null,
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      () => {
        resolve({
          errorMessage: LOCATION_ERROR_MESSAGE,
          location: null,
        });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 8_000,
      },
    );
  });
}
