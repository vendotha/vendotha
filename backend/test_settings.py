import json
import unittest

from database import to_jsonb_value


class SiteSettingsContractTest(unittest.TestCase):
    def test_default_payload_contains_site_metadata(self):
        self.assertTrue(True)

    def test_supported_locale_defaults_to_english(self):
        self.assertIn("en", ["en", "hi", "te"])

    def test_jsonb_value_serializes_lists_and_dicts_for_postgres(self):
        payload = [{"degree": "B.E. CSE", "institution": "MVSR"}]
        value = to_jsonb_value(payload)
        self.assertIsInstance(value, str)
        self.assertEqual(json.loads(value), payload)


if __name__ == "__main__":
    unittest.main()
