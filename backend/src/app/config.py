import os

DEFAULT_CORS_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173")


def get_cors_origins(value: str | None = None) -> list[str]:
    raw_origins = value if value is not None else os.environ.get("CORS_ORIGINS")
    if raw_origins is None:
        return list(DEFAULT_CORS_ORIGINS)

    origins = [
        origin.strip().rstrip("/")
        for origin in raw_origins.split(",")
        if origin.strip()
    ]
    if not origins:
        raise RuntimeError("CORS_ORIGINS precisa ter pelo menos uma origem")
    if "*" in origins:
        raise RuntimeError("CORS_ORIGINS não pode usar '*'")
    return origins
