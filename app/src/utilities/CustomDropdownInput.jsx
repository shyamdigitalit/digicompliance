import React, { useState, useRef, useEffect } from "react";
import '../styles/CustomDropdownInput.css'

const CustomDropdownInput = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  allowCustom = true,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || "";

  const handleSelect = (val) => {
    setIsCustom(false);
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="form-group" ref={ref}>
        {label && <label>{label}</label>}

        {/* Dropdown Input Look-alike */}
        {!isCustom && (
            <div
            className="input-like"
            tabIndex={0}
            onClick={() => !disabled && setOpen((p) => !p)}
            >
            {selectedLabel || (
                <span className="placeholder">{placeholder}</span>
            )}
            </div>
        )}

        {/* Dropdown List */}
        {open && !disabled && (
            <div className="dropdown-list">
            {options.map((opt) => (
                <div
                key={opt.value}
                className="dropdown-item"
                onClick={() => handleSelect(opt.value)}
                >
                {opt.label}
                </div>
            ))}

            {allowCustom && (
                <div
                className="dropdown-action"
                onClick={() => {
                    setIsCustom(true);
                    setOpen(false);
                    onChange("");
                }}
                >
                Other
                </div>
            )}
            </div>
        )}

        {/* Custom Input */}
        {isCustom && (
            <>
            <input
                autoFocus
                placeholder="Enter value"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <span
                className="dropdown-back"
                onClick={() => {
                setIsCustom(false);
                setOpen(true);
                }}
            >
                ← Back to options
            </span>
            </>
        )}
    </div>
  );
};

export default CustomDropdownInput;
