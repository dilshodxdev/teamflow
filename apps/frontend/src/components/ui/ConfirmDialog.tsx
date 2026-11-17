import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "O'chirish",
  cancelLabel = "Bekor qilish",
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col gap-space-lg">
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-space-sm">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            type="button"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
