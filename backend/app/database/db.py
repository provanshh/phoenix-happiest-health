"""SQLite connection utilities and schema initialization for longitudinal health memory and audit trails."""

from __future__ import annotations

import os
import sqlite3
import tempfile
from pathlib import Path


DEFAULT_DB_PATH = Path(os.getenv("CARDIOTWIN_DB_PATH", Path(tempfile.gettempdir()) / "cardiotwin_health_memory.sqlite3"))


def get_connection() -> sqlite3.Connection:
    DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DEFAULT_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                patient_id TEXT DEFAULT 'patient_default',
                provenance_type TEXT DEFAULT 'AUTHORIZED_PATIENT_DATA',
                source_dataset TEXT DEFAULT 'manual_entry',
                final_risk_score REAL,
                risk_category TEXT,
                systolic_bp REAL,
                diastolic_bp REAL,
                heart_rate REAL,
                spo2 REAL,
                sleep_hours REAL,
                signal_quality REAL,
                payload_json TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                event_type TEXT NOT NULL,
                user_role TEXT DEFAULT 'clinician',
                patient_id TEXT,
                record_id TEXT,
                provenance_type TEXT,
                details TEXT
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS model_registry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT NOT NULL,
                version TEXT NOT NULL,
                task TEXT NOT NULL,
                dataset_trained_on TEXT NOT NULL,
                accuracy REAL,
                f1_score REAL,
                metrics_json TEXT,
                checkpoint_path TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Dynamic schema migration for existing SQLite databases
        reading_cols = {row[1] for row in connection.execute("PRAGMA table_info(readings)").fetchall()}
        if "provenance_type" not in reading_cols:
            connection.execute("ALTER TABLE readings ADD COLUMN provenance_type TEXT DEFAULT 'AUTHORIZED_PATIENT_DATA'")
        if "source_dataset" not in reading_cols:
            connection.execute("ALTER TABLE readings ADD COLUMN source_dataset TEXT DEFAULT 'manual_entry'")

        connection.commit()
