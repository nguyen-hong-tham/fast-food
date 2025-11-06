interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
