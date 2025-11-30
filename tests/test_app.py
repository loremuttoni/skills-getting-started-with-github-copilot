from fastapi.testclient import TestClient
from urllib.parse import quote
from uuid import uuid4

from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    res = client.get("/activities")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    # Basic check that seeded activities are present
    assert "Chess Club" in data


def test_signup_and_duplicate_and_remove():
    from fastapi.testclient import TestClient
    from urllib.parse import quote
    from uuid import uuid4

    from src.app import app, activities

    client = TestClient(app)


    def test_get_activities():
        res = client.get("/activities")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, dict)
        # Basic check that seeded activities are present
        assert "Chess Club" in data


    def test_signup_and_duplicate_and_remove():
        activity = "Chess Club"
        email = f"testuser+{uuid4().hex}@example.com"

        # Ensure email not already present
        assert email not in activities[activity]["participants"]

        # Sign up the user
        signup_url = f"/activities/{quote(activity)}/signup?email={quote(email)}"
        res = client.post(signup_url)
        assert res.status_code == 200
        body = res.json()
        assert "Signed up" in body.get("message", "")
        assert email in activities[activity]["participants"]

        # Duplicate signup should fail
        res2 = client.post(signup_url)
        assert res2.status_code == 400
        err = res2.json()
        assert "already" in (err.get("detail") or "")

        # Remove the participant
        delete_url = f"/activities/{quote(activity)}/participants?email={quote(email)}"
        res3 = client.delete(delete_url)
        assert res3.status_code == 200
        assert email not in activities[activity]["participants"]

        # Removing again should return 400
        res4 = client.delete(delete_url)
        assert res4.status_code == 400


    def test_unregistered_activity():
        # Activity that does not exist
        activity = "Nonexistent Activity"
        email = f"nobody+{uuid4().hex}@example.com"

        signup_url = f"/activities/{quote(activity)}/signup?email={quote(email)}"
        res = client.post(signup_url)
        assert res.status_code == 404

        delete_url = f"/activities/{quote(activity)}/participants?email={quote(email)}"
        res2 = client.delete(delete_url)
        assert res2.status_code == 404