export function validateName(name) {
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return "O nome precisa ter pelo menos 2 caracteres.";
  }

  if (trimmedName.length > 80) {
    return "O nome pode ter no máximo 80 caracteres.";
  }

  return "";
}

export function validateDescription(description) {
  if (description.trim().length > 280) {
    return "A descrição pode ter no máximo 280 caracteres.";
  }

  return "";
}

export function normalizeItem(item) {
  return {
    ...item,
    name: item.name.trim(),
    description: item.description.trim(),
  };
}

export function searchItems(items, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

  if (!normalizedQuery) {
    return items;
  }

  return items.filter(
    (item) =>
      item.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ||
      item.description.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
  );
}
