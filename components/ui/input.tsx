import { cn } from "@/lib/utils";

export function Input({
  className,
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <input
        className={cn(
          "w-full h-11 rounded-xl border border-border bg-white px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-[var(--ring)]",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Textarea({
  className,
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <textarea
        className={cn(
          "w-full min-h-28 rounded-xl border border-border bg-white px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-[var(--ring)]",
          className,
        )}
        {...props}
      />
    </label>
  );
}

export function Select({
  className,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <select
        className={cn(
          "w-full h-11 rounded-xl border border-border bg-white px-3.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-[var(--ring)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
