import datetime
import unittest
import jwt

from app.auth import (
    create_access_token,
    decode_access_token,
    verify_password,
    get_password_hash,
)
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES


class TestAuth(unittest.TestCase):
    def test_create_and_decode_token(self):
        payload = {"sub": "alice_user"}
        token = create_access_token(payload)
        self.assertIsInstance(token, str)

        decoded = decode_access_token(token)
        self.assertEqual(decoded.get("sub"), "alice_user")
        self.assertIn("exp", decoded)

        # Check default expiration is approximately ACCESS_TOKEN_EXPIRE_MINUTES from now
        now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        expected_exp = now_ts + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        self.assertAlmostEqual(decoded["exp"], expected_exp, delta=10)

    def test_custom_expires_delta(self):
        delta = datetime.timedelta(minutes=30)
        token = create_access_token({"sub": "bob_user"}, expires_delta=delta)
        decoded = decode_access_token(token)

        now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        expected_exp = now_ts + 1800
        self.assertAlmostEqual(decoded["exp"], expected_exp, delta=10)

    def test_expired_token_raises_expired_signature(self):
        past_delta = datetime.timedelta(seconds=-1)
        token = create_access_token({"sub": "expired_user"}, expires_delta=past_delta)

        with self.assertRaises(jwt.ExpiredSignatureError):
            decode_access_token(token)

    def test_tampered_token_raises_invalid_signature(self):
        token = create_access_token({"sub": "valid_user"})
        # Modify the last characters to invalidate the signature
        tampered_token = token[:-4] + ("aaaa" if token[-4:] != "aaaa" else "bbbb")

        with self.assertRaises(jwt.InvalidSignatureError):
            decode_access_token(tampered_token)

    def test_password_hashing_and_verification(self):
        password = "superSecretPassword123"
        hashed = get_password_hash(password)

        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("wrongPassword", hashed))


if __name__ == "__main__":
    unittest.main()
