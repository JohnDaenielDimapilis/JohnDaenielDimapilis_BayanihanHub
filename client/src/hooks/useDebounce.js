import { useState } from "react";

export default function useDebounce(delay = 300) {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [timer, setTimer] = useState(null);

  function onChange(val) {
    setValue(val);
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => setDebounced(val), delay));
  }

  return { value, debounced, onChange };
}
