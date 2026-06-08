const statusStyles = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-orange-100 text-orange-700',
  cleaning: 'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-green-100 text-green-700',
  checked_out: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
  open: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
  sent: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
};

export default function Badge({ label, variant }) {
  const style = statusStyles[variant] || statusStyles[variant?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style}`}>
      {label || variant}
    </span>
  );
}
