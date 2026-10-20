"""Data ingestion adapters, provenance metadata, and dataset registry."""

from .provenance import ProvenanceType, ProvenanceMetadata, make_provenance
from .dataset_registry import DATASET_CATALOG, get_dataset_info, list_datasets
from .bidmc_adapter import BidmcDatasetAdapter
from .mitbih_adapter import MitBihDatasetAdapter
from .synthea_adapter import SyntheaDatasetAdapter
from .ohiot1dm_adapter import OhioT1DMDatasetAdapter

__all__ = [
    "ProvenanceType",
    "ProvenanceMetadata",
    "make_provenance",
    "DATASET_CATALOG",
    "get_dataset_info",
    "list_datasets",
    "BidmcDatasetAdapter",
    "MitBihDatasetAdapter",
    "SyntheaDatasetAdapter",
    "OhioT1DMDatasetAdapter",
]
