import { Archive, SearchX } from "lucide-react";
import ItemCard from "./ItemCard.jsx";

export default function ItemList({ items, hasItems, hasQuery, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">
          {hasQuery ? <SearchX size={23} /> : <Archive size={23} />}
        </span>
        <h3 className="font-display text-lg font-semibold text-[#243a31]">
          {hasQuery ? "Nenhum resultado por aqui" : "Seu acervo começa agora"}
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">
          {hasQuery
            ? "Tente buscar por outro nome ou palavra da descrição."
            : hasItems
              ? "Adicione seu primeiro item para começar."
              : "Os itens que você adicionar vão aparecer aqui, prontos para encontrar."}
        </p>
      </div>
    );
  }

  return (
    <ul aria-label="Itens cadastrados" className="space-y-3">
      {items.map((item) => (
        <ItemCard item={item} key={item.id} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}
