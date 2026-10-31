import { useEffect, useId, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { normalizeItem, validateDescription, validateName } from "../utils/items.js";

export default function ItemForm({ itemToEdit, onSave, onCancel }) {
  const formId = useId();
  const nameId = `${formId}-name`;
  const nameHintId = `${formId}-name-hint`;
  const nameErrorId = `${formId}-name-error`;
  const descriptionId = `${formId}-description`;
  const descriptionErrorId = `${formId}-description-error`;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setName(itemToEdit?.name ?? "");
    setDescription(itemToEdit?.description ?? "");
    setErrors({});
  }, [itemToEdit]);

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      name: validateName(name),
      description: validateDescription(description),
    };
    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.description) {
      return;
    }

    onSave(
      normalizeItem({
        id: itemToEdit?.id ?? crypto.randomUUID(),
        name,
        description,
      }),
    );
    setName("");
    setDescription("");
    setErrors({});
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="field-label" htmlFor={nameId}>
          Nome <span className="text-rose-600">*</span>
        </label>
        <input
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? nameErrorId : nameHintId}
          className={`field-input ${errors.name ? "field-input-error" : ""}`}
          id={nameId}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Caderno de ideias"
          value={name}
        />
        {errors.name ? (
          <p className="field-error" id={nameErrorId}>
            {errors.name}
          </p>
        ) : (
          <p className="field-hint" id={nameHintId}>
            De 2 a 80 caracteres
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="field-label mb-0" htmlFor={descriptionId}>
            Descrição <span className="font-normal text-stone-400">opcional</span>
          </label>
          <span className="text-xs tabular-nums text-stone-400">{description.length}/280</span>
        </div>
        <textarea
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? descriptionErrorId : undefined}
          className={`field-input min-h-28 resize-y ${errors.description ? "field-input-error" : ""}`}
          id={descriptionId}
          maxLength={300}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Um detalhe que vale a pena lembrar..."
          value={description}
        />
        {errors.description && (
          <p className="field-error" id={descriptionErrorId}>
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button className="button-primary flex-1" type="submit">
          {itemToEdit ? <Check size={17} /> : <Plus size={17} />}
          {itemToEdit ? "Salvar alterações" : "Adicionar item"}
        </button>
        {itemToEdit && (
          <button className="button-secondary" onClick={onCancel} type="button">
            <X size={16} />
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
