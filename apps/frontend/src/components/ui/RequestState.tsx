import React from "react";

export const RequestState: React.FC<{
  loading: boolean;
  error?: string | null;
  onRetry: () => void | Promise<void>;
}> = ({ loading, error, onRetry }) => (
  <>
    {loading && (
      <p
        role="status"
        aria-live="polite"
        className="rounded-xl bg-surface-container-low p-4 text-primary"
      >
        Yuklanmoqda...
      </p>
    )}
    {error && (
      <div
        role="alert"
        className="flex items-center justify-between gap-3 rounded-xl bg-error-container p-4 text-error"
      >
        <span>{error}</span>
        <button
          type="button"
          className="shrink-0 rounded-lg bg-white px-3 py-2 font-semibold"
          onClick={() => void onRetry()}
        >
          Qayta urinish
        </button>
      </div>
    )}
  </>
);
