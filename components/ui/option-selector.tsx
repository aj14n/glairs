import { Label } from "@radix-ui/react-label";

interface Option {
  id: string;
  title: string;
  description: string;
  value: string;
  additionalInfo?: string;
}

interface OptionSelectorProps<T extends string = string> {
  options: Option[];
  value: T | null;
  onChange: (value: T | null) => void;
  label: string;
  className?: string;
}

export const OptionSelector = <T extends string = string>({
  options,
  value,
  onChange,
  label,
  className = ""
}: OptionSelectorProps<T>) => {
  const handleOptionSelect = (optionValue: string) => {
    if (value === optionValue) {
      onChange(null);
    } else {
      onChange(optionValue as T);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-lg font-medium">{label}</Label>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              value === option.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleOptionSelect(option.id)}
          >
            <div className="font-medium">{option.title}</div>
            <div className="text-sm text-gray-500">{option.description}</div>
            {option.additionalInfo && (
              <div className="text-xs text-gray-400 mt-1">{option.additionalInfo}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}; 