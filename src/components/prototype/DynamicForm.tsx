import { useState } from "react";
import type { FormField } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  submitLabel: string;
}

export default function DynamicForm({
  fields,
  onSubmit,
  submitLabel,
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "repeatable") {
        initial[f.key] = [buildEmptyRow(f.fields || [])];
      } else {
        initial[f.key] = "";
      }
    });
    return initial;
  });

  function setValue(key: string, value: any) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(val) => setValue(field.key, val)}
        />
      ))}
      <button
        type="submit"
        className="w-full bg-terra hover:bg-terra-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors text-lg"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: any;
  onChange: (val: any) => void;
}) {
  const labelClasses = "block text-sm font-medium text-warm-gray mb-1.5";
  const inputClasses =
    "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-warm-gray placeholder:text-warm-lighter focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-colors";

  switch (field.type) {
    case "text":
      return (
        <div>
          <label className={labelClasses}>
            {field.label}
            {field.required && <span className="text-terra ml-1">*</span>}
          </label>
          <input
            type="text"
            className={inputClasses}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className={labelClasses}>
            {field.label}
            {field.required && <span className="text-terra ml-1">*</span>}
          </label>
          <textarea
            className={cn(inputClasses, "min-h-[100px] resize-y")}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case "number":
      return (
        <div>
          <label className={labelClasses}>
            {field.label}
            {field.required && <span className="text-terra ml-1">*</span>}
          </label>
          <input
            type="number"
            className={cn(inputClasses, "max-w-[120px]")}
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            min={field.min}
            max={field.max}
            required={field.required}
          />
        </div>
      );

    case "select":
      return (
        <div>
          <label className={labelClasses}>
            {field.label}
            {field.required && <span className="text-terra ml-1">*</span>}
          </label>
          <select
            className={cn(inputClasses, "appearance-none cursor-pointer")}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          >
            <option value="">Choose one...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "date":
      return (
        <div>
          <label className={labelClasses}>
            {field.label}
            {field.required && <span className="text-terra ml-1">*</span>}
          </label>
          <input
            type="date"
            className={cn(inputClasses, "max-w-[200px]")}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        </div>
      );

    case "repeatable":
      return (
        <RepeatableField
          field={field}
          rows={value || []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}

function RepeatableField({
  field,
  rows,
  onChange,
}: {
  field: FormField;
  rows: Record<string, any>[];
  onChange: (rows: Record<string, any>[]) => void;
}) {
  const subFields = field.fields || [];

  function addRow() {
    onChange([...rows, buildEmptyRow(subFields)]);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  }

  function updateRow(index: number, key: string, value: any) {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-warm-gray mb-2">
        {field.label}
      </label>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex gap-3 items-end bg-cream-dark/50 rounded-lg p-3"
          >
            {subFields.map((sf) => (
              <div key={sf.key} className="flex-1">
                <label className="block text-xs text-warm-light mb-1">
                  {sf.label}
                </label>
                <input
                  type={sf.type === "number" ? "number" : "text"}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-warm-gray placeholder:text-warm-lighter focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra"
                  placeholder={sf.placeholder}
                  value={row[sf.key] || ""}
                  onChange={(e) => updateRow(i, sf.key, e.target.value)}
                  min={sf.min}
                  required={sf.required}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => removeRow(i)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                rows.length > 1
                  ? "text-warm-lighter hover:text-terra hover:bg-terra/5"
                  : "text-warm-lighter/30 cursor-not-allowed"
              )}
              disabled={rows.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-terra hover:text-terra-dark transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add another
      </button>
    </div>
  );
}

function buildEmptyRow(
  fields: Omit<FormField, "fields">[]
): Record<string, any> {
  const row: Record<string, any> = {};
  fields.forEach((f) => {
    row[f.key] = "";
  });
  return row;
}
