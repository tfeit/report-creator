import { XMarkIcon } from "@heroicons/react/24/outline";

interface TagProps {
  content: string;
  color?: "blue" | "green" | "yellow" | "red" | "sand";
  onDelete?: () => void;
  type?: "rounded" | "normal";
  enableIcon?: boolean;
}

export default function Tag({
  content,
  color = "blue",
  onDelete,
  type = "normal",
  enableIcon = false
}: TagProps) {
  const baseStyles =
    "flex justify-start items-center gap-2 disabled:opacity-50 disabled:cursor-default whitespace-nowrap max-w-full overflow-hidden w-fit";

  const colorStyles: Record<string, string> = {
    blue: "bg-(--color-blue) text-white",
    sand: `${enableIcon ? "bg-[var(--color-sand)]" : "bg-[var(--color-sand)]"} text-gray-800`,
    green:
      "bg-[var(--color-green)]/20 dark:bg-[var(--color-green)]/70 text-[var(--color-green)] dark:text-white",
    yellow:
      "bg-[var(--color-yellow)]/20 dark:bg-[var(--color-yellow)]/70 text-[var(--color-yellow)] dark:text-white",
    red: "bg-[var(--color-red)]/20 dark:bg-[var(--color-red)]/70 text-[var(--color-red)] dark:text-white"
  };

  const typeStyles: Record<string, string> = {
    rounded: `${enableIcon ? "py-1.5" : "py-2"} rounded-full px-4 text-sm`,
    normal: "rounded-md px-2 py-1 text-xs"
  };

  const getContentIcon = (value: string) => {
    const lower = value?.toLowerCase();
    if (lower.includes("schüler")) return "🎒";
    if (lower.includes("lehrer")) return "🧑‍🏫";
    if (lower.includes("eltern")) return "👥";
    if (lower.includes("schulleitungen")) return "🧑‍💼";
    return "";
  };

  const contentIcon = getContentIcon(content);

  return (
    <span className={`${baseStyles} ${colorStyles[color]} ${typeStyles[type]}`}>
      {contentIcon && <span className="text-base white">{contentIcon}</span>}
      <span className="truncate max-w-full">{content}</span>
      {onDelete && <XMarkIcon className="w-4 h-4 shrink-0" onClick={onDelete} />}
    </span>
  );
}
