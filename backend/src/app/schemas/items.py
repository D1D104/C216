from pydantic import BaseModel, Field, model_validator


class ItemCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None


class ItemUpdate(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None


class ItemPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    description: str | None = None

    @model_validator(mode="after")
    def name_cannot_be_null(self) -> "ItemPatch":
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("name não pode ser nulo")
        return self


class ItemRead(BaseModel):
    id: int
    name: str
    description: str | None = None
