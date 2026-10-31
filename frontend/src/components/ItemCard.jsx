import { AlignLeft, Pencil, Trash2 } from "lucide-react";

export default function ItemCard({ item, onEdit, onDelete }) {
  return (
    <li className="group rounded-xl border border-stone-200/80 bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_-18px_rgba(27,52,45,0.35)] sm:p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#edf3ef] text-[#3d6c58]"
        >
          <AlignLeft size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="break-words font-display text-lg font-semibold leading-snug text-[#243a31]">
            {item.name}
          </h3>
          {item.description ? (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-500">
              {item.description}
            </p>
          ) : (
            <p className="mt-2 text-sm italic text-stone-400">Sem descrição</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            aria-label={`Editar ${item.name}`}
            className="icon-button"
            onClick={() => onEdit(item)}
            title="Editar item"
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            aria-label={`Excluir ${item.name}`}
            className="icon-button icon-button-danger"
            onClick={() => onDelete(item)}
            title="Excluir item"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}
