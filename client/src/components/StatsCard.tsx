import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  bgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  subtitle,
  bgColor = "bg-primary",
}: StatsCardProps) {
  const changeColorClass = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-500",
  }[changeType];

  const iconBgClass = bgColor.replace("bg-", "bg-").replace("primary", "primary/10");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgClass} rounded-lg flex items-center justify-center`}>
          <Icon className={`${bgColor.replace("bg-", "text-")} h-6 w-6`} />
        </div>
      </div>
      {(change || subtitle) && (
        <div className="mt-4 flex items-center text-sm">
          {change && (
            <span className={`flex items-center ${changeColorClass}`}>
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-gray-500">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
