from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    StringConstraints,
    field_validator,
    model_validator,
)

ItemName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=2, max_length=80)
]
ItemDescription = Annotated[
    str, StringConstraints(strip_whitespace=True, max_length=280)
]


class ItemFields(BaseModel):
    @field_validator("description", check_fields=False)
    @classmethod
    def blank_description_is_none(cls, value: str | None) -> str | None:
        return value or None


class ItemCreate(ItemFields):
    name: ItemName
    description: ItemDescription | None = None


class ItemUpdate(ItemFields):
    name: ItemName
    description: ItemDescription | None = None


class ItemPatch(ItemFields):
    name: ItemName | None = None
    description: ItemDescription | None = None

    @model_validator(mode="after")
    def name_cannot_be_null(self) -> "ItemPatch":
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("name não pode ser nulo")
        return self


class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
