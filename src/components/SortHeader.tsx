import { ChevronUp, ChevronDown } from 'lucide-react';

interface SortHeaderProps {
  label: string;
  field: string;
  currentSort: string;
  currentDir: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export default function SortHeader({ label, field, currentSort, currentDir, onSort }: SortHeaderProps) {
  const isActive = currentSort === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors group"
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp
          size={12}
          className={`${isActive && currentDir === 'asc' ? 'text-blue-600' : 'text-gray-400'} group-hover:text-blue-500 transition-colors`}
        />
        <ChevronDown
          size={12}
          className={`${isActive && currentDir === 'desc' ? 'text-blue-600' : 'text-gray-400'} -mt-1 group-hover:text-blue-500 transition-colors`}
        />
      </span>
    </button>
  );
}
