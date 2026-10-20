"""Automated tests for dataset adapters, provenance metadata, and MIT-BIH prediction."""

import unittest
from backend.app.data_ingestion import (
    BidmcDatasetAdapter,
    MitBihDatasetAdapter,
    SyntheaDatasetAdapter,
    OhioT1DMDatasetAdapter,
    list_datasets,
    get_dataset_info,
)
from backend.app.data_ingestion.ohiot1dm_adapter import OhioT1DMPendingAccessError


class TestDatasetIngestion(unittest.TestCase):
    def test_dataset_catalog_contains_official_sources(self):
        datasets = list_datasets()
        ids = {d["dataset_id"] for d in datasets}
        self.assertIn("bidmc", ids)
        self.assertIn("mitbih", ids)
        self.assertIn("synthea", ids)
        self.assertIn("ohiot1dm", ids)

        bidmc = get_dataset_info("bidmc")
        self.assertEqual(bidmc["provenance_type"], "OPEN_RESEARCH_DATA")
        self.assertFalse(bidmc["is_synthetic"])

        synthea = get_dataset_info("synthea")
        self.assertEqual(synthea["provenance_type"], "SYNTHETIC_EHR")
        self.assertTrue(synthea["is_synthetic"])

    def test_bidmc_adapter_loads_real_waveform(self):
        adapter = BidmcDatasetAdapter()
        records = adapter.list_available_records()
        self.assertIn("bidmc_01", records)

        rec = adapter.load_record("bidmc_01")
        self.assertEqual(rec["sampling_frequency_hz"], 125.0)
        self.assertGreater(rec["total_samples"], 1000)
        self.assertIn("PLETH", rec["channels"])
        self.assertEqual(rec["provenance"]["provenance_type"], "OPEN_RESEARCH_DATA")
        self.assertFalse(rec["provenance"]["is_synthetic"])

    def test_mitbih_adapter_loads_annotations(self):
        adapter = MitBihDatasetAdapter()
        records = adapter.list_available_records()
        self.assertIn("mitbih_100", records)

        rec = adapter.load_record("mitbih_100")
        self.assertEqual(rec["sampling_frequency_hz"], 360.0)
        self.assertGreater(len(rec["annotations"]), 0)
        self.assertEqual(rec["provenance"]["provenance_type"], "OPEN_RESEARCH_DATA")

    def test_synthea_adapter_stamps_synthetic_notice(self):
        adapter = SyntheaDatasetAdapter()
        records = adapter.list_available_records()
        self.assertIn("synthea_normotensive", records)

        rec = adapter.load_record("synthea_normotensive")
        self.assertTrue(rec["is_synthetic"])
        self.assertEqual(rec["provenance"]["provenance_type"], "SYNTHETIC_EHR")
        self.assertIn("SYNTHETIC RESEARCH RECORD", rec["synthetic_notice"])

    def test_ohiot1dm_access_requires_dua(self):
        adapter = OhioT1DMDatasetAdapter()
        with self.assertRaises(OhioT1DMPendingAccessError):
            adapter.load_record("subject_559")


if __name__ == "__main__":
    unittest.main()
