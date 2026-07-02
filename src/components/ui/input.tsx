import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-muted">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
          "placeholder:text-subtle focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20",
          className,
        )}
        {...props}
      />
    </div>
  );
}
