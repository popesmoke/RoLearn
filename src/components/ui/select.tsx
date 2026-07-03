import { cn, formatCategory } from "@/lib/utils";

type Option = string | { value: string; label: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: readonly Option[];
};

function normalizeOption(option: Option) {
  if (typeof option === "string") {
    return { value: option, label: formatCategory(option) };
  }
  return option;
}

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
          "h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
          "focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20",
          className,
        )}
        {...props}
      >
        {options.map((option) => {
          const { value, label: optionLabel } = normalizeOption(option);
          return (
            <option key={value || "__empty"} value={value}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
