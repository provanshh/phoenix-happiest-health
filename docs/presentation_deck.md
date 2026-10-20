# CardioTwin AI — Project Presentation Deck
### Digital Twin Challenge 2026 | Happiest Health Summit, Bengaluru

---

## Slide 1: Title Slide
* **Project Title:** CardioTwin AI — Multimodal Cardiovascular Digital Twin Platform
* **Event:** Happiest Health Reimagining and Reforming Healthcare in India Summit — 2026, Bengaluru
* **Challenge:** Digital Twin Challenge 2026 (Proof-of-Concept Category)
* **Team Phoenix:**
  * **Vansh Singla** (Team Leader, Full-Stack & Biomedical AI Lead)
  * **Dev Garg** (ML Engineer & Signal Processing)
  * **Prince Pal** (Healthcare Data Architect & Frontend Engineer)
* **College & Incubator:**
  * **Maharaja Agrasen Institute of Technology (MAIT), Delhi**
  * **MAIT Innovation & Incubation Centre (MAIT-IIC)**

---

## Slide 2: Problem Statement — The Cardiovascular Crisis in India
* **Leading Cause of Mortality:** Cardiovascular disease (CVD) is responsible for over **28% of all deaths in India** (ICMR).
* **The "Silent Killer":** Over **200 million Indians** live with chronic hypertension, with the majority unaware until suffering a stroke, myocardial infarction, or heart failure.
* **The Reactive Paradigm:** Current Indian clinical workflows react only after an acute event occurs.
* **The Opportunity:** A digital twin continuously pairs patient history with wearable telemetry, forecasting acute events days in advance.

---

## Slide 3: The Healthcare Use Case — Dual-Stream Data Fusion
* **Stream 1 (Static EHR):**
  * Ingests demographics, comorbidities (hypertension, diabetes), medications, and lab observations.
  * Powered by the **Synthea Synthetic Electronic Health Record** framework.
* **Stream 2 (Dynamic Wearable Telemetry):**
  * Ingests high-frequency time-series signals: 125 Hz continuous photoplethysmogram (**PhysioNet BIDMC PPG**) and 360 Hz continuous ECG (**PhysioNet MIT-BIH**).
  * Real-time Bluetooth Low Energy (BLE) stream state machine (`DISCONNECTED` ➔ `CONNECTED` ➔ `RECEIVING_DATA`).

---

## Slide 4: AI/ML Engineering & Signal Processing
* **SciPy Signal Processing:** 3rd-order Butterworth bandpass filter (0.5–5.0 Hz), peak detection, and Heart Rate Variability (HRV) extraction.
* **MIT-BIH Arrhythmia Machine Learning Model:**
  * Supervised Random Forest classifier trained on PhysioNet MIT-BIH database using strict participant-level separation (trained on records `100` & `106`; evaluated on held-out subject `119`).
  * Achieves **71.74% accuracy** and **0.599 weighted F1** on held-out real ECG beats.
* **Multimodal Late-Fusion Algorithm:** Combines signal quality, tabular vitals, and negation-aware NLP symptom features into an interpretable 0–100 Cardiovascular Risk Index.
* **Explainable AI (XAI):** Modality influence attribution mathematically explains *why* the patient is at risk.

---

## Slide 5: The Doctor-Facing Interactive Dashboard
* **3D Translucent Digital Twin Avatar:** Living SVG heart and cardiovascular network with animated cardiac pulse and DNA double-helix motifs.
* **4 Live Physiological Hotspots:**
  1. *Trigeminal Autonomic:* Sinus rhythm, SA node firing rate, and resting heart rate.
  2. *Posterior Hypothalamus:* Autonomic tone & Heart Rate Variability (HRV).
  3. *Trigeminovascular System:* Arterial compliance & blood pressure tone.
  4. *Autonomic Reflex:* Capillary perfusion & blood oxygen saturation (SpO2).
* **Doctor Workflows:** Active complaints tracking with NLP, checkup schedule timeline, and ReportLab 3.0 stamped medical PDF report export.
* **Guided Onboarding Tour:** Built-in 6-step walkthrough with spotlights and directional pointer arrows for first-time evaluators.

---

## Slide 6: Data Privacy, Security & DPDP Act Compliance
* **Data Sandbox Adherence:** Built strictly with anonymized open research databases (PhysioNet) and synthetic patient records (Synthea).
* **Strict Provenance Tagging:** Every record is immutably tagged: `OPEN_RESEARCH_DATA`, `SYNTHETIC_EHR`, or `AUTHORIZED_PATIENT_DATA`.
* **Zero Silent Mock Data:** No fabricated patient profiles or simulated vitals are silently passed off as real patient data.
* **DPDP Act 2023 & HIPAA Compliance:** All processing occurs locally on the clinical machine. Zero unauthorized third-party data egress.

---

## Slide 7: Outcomes, Impact & Future Roadmap
* **Proactive Clinical Triage:** Enables Indian primary health centres (PHCs) and urban clinics to triage cardiovascular risk remotely before acute decompensation.
* **Scalable Prototype:** Seamless transition from research datasets to real hospital EHRs (FHIR standards) and consumer wearables (Apple Health, Google Fit, pulse oximeters).
* **Open Source Commitment:** Released under the MIT License for public research collaboration.
