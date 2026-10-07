import { useEffect, useState } from "react";
import { fetchHotels } from "./api";

export function useHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    fetchHotels()
      .then((loadedHotels) => {
        if (isCurrent) setHotels(loadedHotels);
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.message);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadCount]);

  function reloadHotels() {
    setLoading(true);
    setError("");
    setReloadCount((count) => count + 1);
  }

  return {
    hotels,
    setHotels,
    loading,
    error,
    reloadHotels,
  };
}
