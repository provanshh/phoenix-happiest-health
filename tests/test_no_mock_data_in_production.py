"""Automated regression test verifying that no mock, demo, or fallback data is silently injected into the production application."""

import unittest
from fastapi.testclient import TestClient

from backend.app.main import app


class TestNoMockDataInProduction(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_and_health_expose_research_prototype_status(self):
        root = self.client.get("/").json()
        self.assertEqual(root["system_status"], "RESEARCH_PROTOTYPE_NOT_CLINICALLY_VALIDATED")

        health = self.client.get("/health").json()
        self.assertEqual(health["system_status"], "RESEARCH_PROTOTYPE_NOT_CLINICALLY_VALIDATED")

    def test_empty_multimodal_fusion_returns_insufficient_data(self):
        """Verifies that empty payload does NOT generate a synthetic/invented risk score."""
        res = self.client.post("/multimodal-risk", json={})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "insufficient_data")
        self.assertFalse(data["available"])
        self.assertIsNone(data["final_risk_score"])
        self.assertEqual(data["risk_category"], "Insufficient Data")
        self.assertIn("Cannot calculate cardiovascular risk score", data["message"])
        self.assertEqual(data["system_status"], "RESEARCH_PROTOTYPE_NOT_CLINICALLY_VALIDATED")

    def test_empty_signal_upload_does_not_load_sample_ppg(self):
        """Verifies that calling /analyze-signal without data returns no_signal_provided."""
        res = self.client.post("/analyze-signal")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["available"])
        self.assertEqual(data["status"], "no_signal_provided")
        self.assertIn("No PPG signal data was provided", data["error"])
        self.assertIsNone(data["heart_rate_estimate"])

    def test_empty_image_upload_does_not_load_hardcoded_report_text(self):
        """Verifies that calling /analyze-image without data returns no_image_provided."""
        res = self.client.post("/analyze-image")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["available"])
        self.assertEqual(data["status"], "no_image_provided")
        self.assertEqual(data["ocr_text"], "")
        self.assertEqual(data["extracted_values"], {})

    def test_empty_trends_does_not_load_sample_history(self):
        """Verifies that calling /analyze-trends without records returns no_data."""
        res = self.client.post("/analyze-trends", json={"records": []})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["available"])
        self.assertEqual(data["status"], "no_data")
        self.assertEqual(data["chart_data"], [])

    def test_default_device_stream_is_disconnected(self):
        """Verifies that the application default is DISCONNECTED, not active simulated telemetry."""
        res = self.client.get("/device/stream-status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["connection_state"], "DISCONNECTED")
        self.assertFalse(data["is_receiving"])
        self.assertIn("No live sensor connection", data["status_message"])

    def test_live_simulation_is_explicitly_flagged_as_simulation(self):
        """Verifies that simulated feeds are never presented as real patient telemetry."""
        res = self.client.get("/live-simulation")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "SIMULATED_STREAM")
        self.assertEqual(data["provenance_type"], "SIMULATED_SENSOR_STREAM")
        self.assertTrue(data["is_simulated"])
        self.assertIn("NOT live patient telemetry", data["warning"])


if __name__ == "__main__":
    unittest.main()
