import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  gradient?: string;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
  onClick?: () => void;
}

const trendColor = {
  up: "text-green-500",
  down: "text-red-500",
  neutral: "text-muted-foreground",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  gradient = "from-indigo-500 to-indigo-600",
  trend = "up",
  trendText,
  onClick,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className="
      group
      rounded-2xl
      border
      bg-background
      p-5
      shadow-sm
      transition-all
      duration-300
      hover:shadow-lg
      hover:-translate-y-1
      cursor-pointer
      select-none
      "
    >
      <div
        className={`
        w-10
        h-10
        rounded-xl
        bg-gradient-to-br
        ${gradient}
        flex
        items-center
        justify-center
        text-white
        shadow-md
        transition-transform
        duration-300
        group-hover:scale-110
        `}
      >
        {icon}
      </div>

      <h2 className="mt-4 text-3xl font-bold tracking-tight">
        {value}
      </h2>

      <p className="text-sm text-muted-foreground font-medium mt-1">
        {title}
      </p>

      {trendText && (
        <div
          className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendColor[trend]}`}
        >
          <TrendingUp size={14} />
          <span>{trendText}</span>
        </div>
      )}

      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground/70">
          {subtitle}
        </p>
      )}
    </div>
  );
}