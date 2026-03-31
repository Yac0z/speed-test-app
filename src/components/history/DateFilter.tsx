type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

type DateFilterProps = {
  value: DateRange;
  onChange: (value: DateRange) => void;
};

const options: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
];

export function DateFilter(props: DateFilterProps) {
  const { value, onChange } = props;

  return (
    <div className="flex rounded-lg border border-slate-700/50 bg-slate-800/50 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            onChange(option.value);
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
