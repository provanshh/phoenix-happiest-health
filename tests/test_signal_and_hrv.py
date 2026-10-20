"""Automated tests for signal processing, peak detection, and HRV duration safeguards."""

import unittest
import numpy as np

from backend.app.models.signal_model import analyze_ppg_signal


class TestSignalAndHRV(unittest.TestCase):
    def test_short_signal_suppresses_hrv(self):
        """Verifies that HRV (SDNN) is NOT reported on signals shorter than 30 seconds."""
        fs = 64.0
        duration_short = 10.0  # 10 seconds
        t = np.arange(int(fs * duration_short)) / fs
        # Synthetic clean PPG pulse at 72 bpm
        signal = np.sin(2 * np.pi * 1.2 * t) * 50 + 100

        result = analyze_ppg_signal(signal, fs=fs, timestamps=t)
        self.assertTrue(result["available"])
        self.assertEqual(result["features"]["hrv_status"], "insufficient_duration_or_peaks_for_hrv")
        self.assertIsNone(result["features"]["hrv_sdnn_ms"])

    def test_adequate_signal_reports_valid_hrv(self):
        """Verifies that a 35-second signal with sufficient peaks reports valid HRV."""
        fs = 64.0
        duration_long = 35.0  # 35 seconds
        t = np.arange(int(fs * duration_long)) / fs
        # Synthetic pulse with slight HRV variation
        signal = np.sin(2 * np.pi * 1.2 * t) * 50 + 100

        result = analyze_ppg_signal(signal, fs=fs, timestamps=t)
        self.assertTrue(result["available"])
        self.assertEqual(result["features"]["hrv_status"], "valid")
        self.assertIsNotNone(result["features"]["hrv_sdnn_ms"])

    def test_heuristic_bp_is_explicitly_labeled(self):
        """Verifies that BP approximation is marked as heuristic, NOT an ML prediction."""
        fs = 64.0
        t = np.arange(int(fs * 15.0)) / fs
        signal = np.sin(2 * np.pi * 1.2 * t) * 50 + 100

        result = analyze_ppg_signal(signal, fs=fs, timestamps=t)
        bp = result["bp_prediction"]
        self.assertEqual(bp["method"], "experimental_heuristic_approximation")
        self.assertIn("Not an ML model", bp["warning"])


if __name__ == "__main__":
    unittest.main()
