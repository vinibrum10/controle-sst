import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "./toast-context";

const DURATION = 2600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string) => {
    setMessage(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), DURATION);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed right-[22px] bottom-[22px] z-50 max-w-[min(420px,calc(100vw-44px))] rounded-[8px] bg-[#12201d] px-3.5 py-3 text-white shadow-[0_12px_30px_rgba(20,33,31,0.08)] transition-all duration-200 ${
          message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2.5 opacity-0"
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
