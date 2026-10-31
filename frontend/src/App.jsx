import { useId, useMemo, useState } from "react";
import { Archive, ArrowUpRight, Layers3, Search } from "lucide-react";
import ItemForm from "./components/ItemForm.jsx";
import ItemList from "./components/ItemList.jsx";
import { searchItems } from "./utils/items.js";

export default function App() {
  const appId = useId();
  const mainId = `${appId}-inicio`;
  const formHeadingId = `${appId}-form-heading`;
  const itemsHeadingId = `${appId}-items-heading`;
  const searchId = `${appId}-item-search`;
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [itemToEdit, setItemToEdit] = useState(null);
  const [notice, setNotice] = useState("");
  const filteredItems = useMemo(() => searchItems(items, query), [items, query]);
  const hasQuery = query.trim().length > 0;

  function saveItem(item) {
    if (itemToEdit) {
      setItems((currentItems) =>
        currentItems.map((currentItem) => (currentItem.id === item.id ? item : currentItem)),
      );
      setNotice(`“${item.name}” foi atualizado.`);
      setItemToEdit(null);
      return;
    }

    setItems((currentItems) => [item, ...currentItems]);
    setNotice(`“${item.name}” foi adicionado ao seu acervo.`);
  }

  function deleteItem(item) {
    if (!window.confirm(`Tem certeza que deseja excluir “${item.name}”?`)) {
      return;
    }
    setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
    if (itemToEdit?.id === item.id) {
      setItemToEdit(null);
    }
    setNotice(`“${item.name}” foi excluído.`);
  }

  function startEditing(item) {
    setItemToEdit(item);
    setNotice("");
  }

  return (
    <div className="min-h-screen bg-[#f6f5f0]">
      <header className="border-b border-[#e9e7df] bg-[#f9f8f4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a aria-label="Acervo, início" className="flex items-center gap-3" href={`#${mainId}`}>
            <span className="grid size-10 place-items-center rounded-xl bg-[#244637] text-[#e8d7a4]">
              <Layers3 size={20} strokeWidth={1.8} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-[#243a31]">
              acervo<span className="text-[#bc7659]">.</span>
            </span>
          </a>
          <span className="hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-400 sm:flex">
            <span className="size-1.5 rounded-full bg-[#70957d]" />
            Seu espaço, do seu jeito
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14" id={mainId}>
        <section className="relative overflow-hidden rounded-2xl bg-[#244637] px-7 py-9 text-white sm:px-11 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-32 size-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 -top-24 size-64 rounded-full border border-white/10"
          />
          <div className="relative max-w-xl">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c892]">
              <span className="h-px w-6 bg-[#d9c892]" />
              Organização com intenção
            </p>
            <h1 className="font-display text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl">
              Tudo o que importa,
              <br />
              <span className="text-[#d9c892]">em um só lugar.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base">
              Reúna suas ideias, anotações e referências em um acervo simples de cuidar.
            </p>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className="absolute bottom-8 right-9 hidden text-[#d9c892]/70 sm:block"
            size={24}
          />
        </section>

        <section aria-label="Resumo do acervo" className="grid grid-cols-2 gap-3 py-6 sm:gap-4">
          <div className="stat-card">
            <span className="stat-label">Itens no acervo</span>
            <span className="stat-value" data-testid="item-count">
              {items.length.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Com descrição</span>
            <span className="stat-value" data-testid="described-count">
              {items
                .filter((item) => item.description)
                .length.toString()
                .padStart(2, "0")}
            </span>
          </div>
        </section>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.42fr)] lg:gap-8">
          <section
            aria-labelledby={formHeadingId}
            className="rounded-2xl border border-[#e9e7df] bg-white p-6 shadow-[0_4px_20px_-16px_rgba(27,52,45,0.28)] sm:p-7"
          >
            <div className="mb-6">
              <p className="section-eyebrow">
                {itemToEdit ? "Ajuste os detalhes" : "Novo registro"}
              </p>
              <h2 className="section-title" id={formHeadingId}>
                {itemToEdit ? "Editar item" : "Adicionar ao acervo"}
              </h2>
            </div>
            <ItemForm
              itemToEdit={itemToEdit}
              onCancel={() => setItemToEdit(null)}
              onSave={saveItem}
            />
          </section>

          <section aria-labelledby={itemsHeadingId} className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-eyebrow">Sua coleção</p>
                <h2 className="section-title" id={itemsHeadingId}>
                  Itens salvos
                  <span className="ml-2 align-middle font-sans text-sm font-medium text-stone-400">
                    {items.length}
                  </span>
                </h2>
              </div>
            </div>

            <div className="relative mb-4">
              <Search
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <label className="sr-only" htmlFor={searchId}>
                Buscar itens
              </label>
              <input
                className="field-input !rounded-xl !border-[#e9e7df] !bg-white !py-3 !pl-11"
                id={searchId}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou descrição..."
                type="search"
                value={query}
              />
            </div>

            {notice && (
              <output
                aria-live="polite"
                className="mb-4 rounded-lg border border-[#d6e5d9] bg-[#edf5ee] px-4 py-3 text-sm text-[#315b41]"
              >
                {notice}
              </output>
            )}

            {hasQuery && filteredItems.length > 0 && (
              <output aria-live="polite" className="mb-3 text-xs text-stone-500">
                {filteredItems.length} {filteredItems.length === 1 ? "resultado" : "resultados"}
              </output>
            )}

            <ItemList
              hasItems={items.length > 0}
              hasQuery={hasQuery}
              items={filteredItems}
              onDelete={deleteItem}
              onEdit={startEditing}
            />
          </section>
        </div>
      </main>

      <footer className="border-t border-[#e9e7df] px-5 py-6 text-center text-xs text-stone-400">
        <span className="inline-flex items-center gap-2">
          <Archive size={13} />
          Um acervo só seu, sempre por perto.
        </span>
      </footer>
    </div>
  );
}
