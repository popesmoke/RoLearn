import { cn, formatCategory } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: readonly string[];
};

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-muted">
          {label}
        </label>
      ) : null}
      <select
        id={inputId}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
          "focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatCategory(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
