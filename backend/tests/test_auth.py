from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.api.deps import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.main import app
from app.models import User

TEST_TOKEN_URL = f"{settings.API_V1_STR}/login/test-token"


@pytest.fixture
def session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture
def client(session):
    app.dependency_overrides[get_db] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()


def auth_header(subject: str) -> dict[str, str]:
    token = create_access_token(subject, expires_delta=timedelta(minutes=5))
    return {"Authorization": f"Bearer {token}"}


def test_valid_token_returns_current_user(client, session):
    user = User(email="ada@example.com", hashed_password="unused")
    session.add(user)
    session.commit()

    response = client.post(TEST_TOKEN_URL, headers=auth_header(str(user.id)))

    assert response.status_code == 200
    assert response.json()["email"] == "ada@example.com"


def test_token_with_malformed_subject_is_rejected(client):
    response = client.post(TEST_TOKEN_URL, headers=auth_header("not-a-uuid"))

    assert response.status_code == 403
