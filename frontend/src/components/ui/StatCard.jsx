export default function StatCard({ label, value, sub, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };
  return (
    <div className={`rounded-xl p-4 border ${colors[color] || colors.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium opacity-75">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {sub && <div className="text-xs mt-1 opacity-75">{sub}</div>}
        </div>
        {Icon && <Icon size={24} className="opacity-50" />}
      </div>
    </div>
  );
}
