import "./ChipSelector.css";

function ChipSelector({
  options,
  selectedValues,
  onChange
}) {
  const toggleOption = (option) => {
    if (selectedValues.includes(option)) {
      onChange(
        selectedValues.filter(
          (value) => value !== option
        )
      );
    } else {
      onChange([
        ...selectedValues,
        option
      ]);
    }
  };

  return (
    <div className="chip-selector">
      {options.map((option) => {
        const isSelected =
          selectedValues.includes(option);

        return (
          <button
            type="button"
            key={option}
            className={`selection-chip ${
              isSelected
                ? "selection-chip-selected"
                : ""
            }`}
            onClick={() => toggleOption(option)}
          >
            {isSelected && (
              <span className="chip-check">
                ✓
              </span>
            )}

            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ChipSelector;