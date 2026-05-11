import { useEffect, useState } from "react";

import api from "../services/api";

export function useResource(endpoint, fallback = []) {
  const [data, setData] = useState(fallback);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(endpoint));

  useEffect(() => {
    if (!endpoint) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    api
      .get(endpoint)
      .then((response) => {
        if (isMounted) {
          setData(response.data.reportData || response.data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setData(fallback);
          setError(requestError.response?.data?.message || "Live data is unavailable. Showing sample records.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { data, error, isLoading, setData };
}
