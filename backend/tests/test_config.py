import pytest

from app.core.config import Settings


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ('["https://chainintel.pages.dev"]', ["https://chainintel.pages.dev"]),
        (
            "https://chainintel.pages.dev, https://preview.chainintel.pages.dev",
            ["https://chainintel.pages.dev", "https://preview.chainintel.pages.dev"],
        ),
        ("", []),
    ],
)
def test_cors_origins_from_environment(monkeypatch, value, expected):
    monkeypatch.setenv("CI_CORS_ORIGINS", value)

    settings = Settings(_env_file=None)

    assert settings.cors_origins == expected
