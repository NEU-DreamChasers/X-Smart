"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn } from "./utils";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within Dialog");
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open);
  
  React.useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  return (
    <DialogContext.Provider value={{ open: internalOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ 
  children, 
  asChild,
  ...props 
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const { onOpenChange } = useDialog();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const { open } = useDialog();
  
  // Chỉ render trên client side để tránh lỗi hydration
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;
  
  // 👇 SỬA Ở ĐÂY: Dùng createPortal từ react-dom
  return typeof document !== 'undefined' 
    ? createPortal(children, document.body)
    : null;
}

function DialogOverlay({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { onOpenChange } = useDialog();
  
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 animate-in fade-in-0",
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useDialog();

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={cn(
          "fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
          "bg-white dark:bg-gray-950 rounded-lg border shadow-lg p-6",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <DialogClose />
      </div>
    </DialogPortal>
  );
}

function DialogClose({ 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useDialog();
  
  return (
    <button
      type="button"
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:pointer-events-none",
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      <XIcon className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

function DialogHeader({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function DialogDescription({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};