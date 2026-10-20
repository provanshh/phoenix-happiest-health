"""Script to generate Hackathon PDF submission assets:
1. docs/CardioTwin_AI_Architecture_Diagram.pdf
2. docs/CardioTwin_AI_Project_Presentation.pdf
"""

from pathlib import Path
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def generate_architecture_pdf():
    pdf_path = DOCS_DIR / "CardioTwin_AI_Architecture_Diagram.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0066FF"),
    )
    subtitle_style = ParagraphStyle(
        "DocSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#475569"),
    )
    section_style = ParagraphStyle(
        "SectionHead",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#111827"),
    )
    cell_style = ParagraphStyle(
        "CellText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1e293b"),
    )
    cell_bold = ParagraphStyle(
        "CellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#0066FF"),
    )

    elements = []
    elements.append(Paragraph("CardioTwin AI — System Architecture & Data Flow Diagram", title_style))
    elements.append(Paragraph("Digital Twin Challenge 2026 | Happiest Health Reimagining Healthcare Summit, Bengaluru<br/><b>Team Phoenix:</b> Vansh Singla (Lead), Dev Garg, Prince Pal | <b>Maharaja Agrasen Institute of Technology (MAIT), Delhi</b>", subtitle_style))
    elements.append(Spacer(1, 16))

    # Architecture Pipeline Table
    data = [
        [
            Paragraph("<b>STREAM 1: STATIC EHR</b>", cell_bold),
            Paragraph("<b>STREAM 2: DYNAMIC WEARABLES</b>", cell_bold),
            Paragraph("<b>DATA INGESTION & PIPELINE</b>", cell_bold),
            Paragraph("<b>AI / ML MODELS & PREDICTION</b>", cell_bold),
            Paragraph("<b>CLINICIAN DIGITAL TWIN UI</b>", cell_bold),
        ],
        [
            Paragraph("• Synthea Synthetic EHR Engine<br/>• Patient Demographics (Age, Sex)<br/>• Chronic Comorbidities (HTN, T2D)<br/>• Lab Observations & BMI<br/>• Medication Status", cell_style),
            Paragraph("• PhysioNet BIDMC PPG (125 Hz)<br/>• PhysioNet MIT-BIH ECG (360 Hz)<br/>• Continuous Plethysmograms<br/>• Real-Time BLE IoT State Machine<br/>• Wearable Photoplethysmography", cell_style),
            Paragraph("• SciPy 3rd-order Butterworth Filter (0.5–5.0 Hz bandpass)<br/>• Real-time Peak Detection<br/>• Signal Quality Index (SQI)<br/>• Negation-aware NLP Parser<br/>• Strict Provenance Isolation", cell_style),
            Paragraph("• <b>Multimodal Late-Fusion Engine</b><br/>• <b>MIT-BIH Arrhythmia Model:</b> Supervised Random Forest (AAMI)<br/>• Arterial Pressure & BP Forecast<br/>• Explainable AI (XAI) Attribution<br/>• SQLite Longitudinal Memory", cell_style),
            Paragraph("• 3D Glowing Digital Twin Avatar<br/>• 4 Live Telemetry Hotspots<br/>• Dynamic Symptoms & Complaints<br/>• Checkup Timeline & Consults<br/>• Stamped ReportLab PDF Export<br/>• Contextual AI Chatbot", cell_style),
        ],
    ]

    t = Table(data, colWidths=[140, 150, 155, 155, 140])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0effe")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0066FF")),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("INNERGRID", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
        ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#0066FF")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 16))

    # Provenance & Safety Architecture
    elements.append(Paragraph("<b>DATA PRIVACY, SECURITY & DPDP ACT COMPLIANCE LAYER:</b>", section_style))
    elements.append(Spacer(1, 4))
    
    compliance_data = [
        [
            Paragraph("<b>Provenance Classification</b>", cell_bold),
            Paragraph("<b>Data Security & Isolation</b>", cell_bold),
            Paragraph("<b>Algorithmic Transparency</b>", cell_bold),
        ],
        [
            Paragraph("• <b>OPEN_RESEARCH_DATA:</b> PhysioNet BIDMC & MIT-BIH open databases.<br/>• <b>SYNTHETIC_EHR:</b> Synthea model profiles; visibly flagged as synthetic.<br/>• <b>AUTHORIZED_PATIENT_DATA:</b> User entries stored locally in SQLite.", cell_style),
            Paragraph("• Zero data transmission to third parties.<br/>• Local execution on patient premises.<br/>• Complies with Digital Personal Data Protection (DPDP) Act 2023 & HIPAA.<br/>• Zero silent mock fallbacks active in production.", cell_style),
            Paragraph("• Explainable AI (XAI) feature contribution breakdown.<br/>• AAMI standard beat classification metrics.<br/>• Participant-level train/test separation (zero data leakage).<br/>• Prominent clinical supervision prototype notice.", cell_style),
        ]
    ]

    ct = Table(compliance_data, colWidths=[245, 245, 250])
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#94a3b8")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(ct)

    doc.build(elements)
    print(f"Generated Architecture PDF: {pdf_path}")

def generate_presentation_pdf():
    pdf_path = DOCS_DIR / "CardioTwin_AI_Project_Presentation.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    slide_title = ParagraphStyle(
        "SlideTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0066FF"),
    )
    slide_subtitle = ParagraphStyle(
        "SlideSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#64748b"),
    )
    body_style = ParagraphStyle(
        "SlideBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
    )
    bullet_style = ParagraphStyle(
        "SlideBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#334155"),
    )

    elements = []

    # SLIDE 1: Title Slide
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("CardioTwin AI", ParagraphStyle("TitleMain", fontName="Helvetica-Bold", fontSize=32, leading=38, textColor=colors.HexColor("#0066FF"))))
    elements.append(Paragraph("A Multimodal Cardiovascular Digital Twin Platform for Proactive Care", ParagraphStyle("SubMain", fontName="Helvetica-Bold", fontSize=16, leading=22, textColor=colors.HexColor("#111827"))))
    elements.append(Spacer(1, 16))
    elements.append(Paragraph("<b>Happiest Health Reimagining and Reforming Healthcare in India Summit — 2026</b><br/><i>Digital Twin Challenge 2026, Bengaluru</i>", slide_subtitle))
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("<b>Submitted by Team Phoenix:</b><br/>• <b>Vansh Singla</b> (Team Leader, Full-Stack & Biomedical AI Lead)<br/>• <b>Dev Garg</b> (ML Engineer & Signal Processing)<br/>• <b>Prince Pal</b> (Healthcare Data Architect & Frontend Engineer)<br/><br/><b>College & Incubator:</b> Maharaja Agrasen Institute of Technology (MAIT), Delhi<br/>MAIT Innovation & Incubation Centre", body_style))
    elements.append(PageBreak())

    # SLIDE 2: Problem Statement & Healthcare in India
    elements.append(Paragraph("1. Problem Statement: The Cardiovascular Crisis in India", slide_title))
    elements.append(Paragraph("Why proactive digital twin medicine is urgent in India", slide_subtitle))
    elements.append(Spacer(1, 14))
    elements.append(Paragraph("• <b>Mortality Leader:</b> Cardiovascular diseases (CVDs) account for <b>over 28% of all deaths in India</b> (ICMR, GBD Study).", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>The 'Silent Killer':</b> Hypertension affects over <b>200 million Indian adults</b>, with >60% unaware until an acute event strikes.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Reactive Healthcare Model:</b> Traditional cardiology is reactive—diagnosing patients only after symptoms, infarcts, or strokes occur.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>The Digital Twin Solution:</b> Create a living, dynamic virtual patient replica that continuously simulates physiological state, fuses historical records with real-time wearable streams, and predicts adverse events days before they happen.", bullet_style))
    elements.append(PageBreak())

    # SLIDE 3: Two Data Streams Fusion Architecture
    elements.append(Paragraph("2. Dual-Stream Multimodal Data Ingestion", slide_title))
    elements.append(Paragraph("Fusing static clinical history with continuous wearable signals", slide_subtitle))
    elements.append(Spacer(1, 14))
    
    stream_table = [
        [
            Paragraph("<b>STREAM 1: STATIC EHR (Past Medical Context)</b>", ParagraphStyle("TH1", fontName="Helvetica-Bold", fontSize=10, textColor=colors.HexColor("#0066FF"))),
            Paragraph("<b>STREAM 2: DYNAMIC WEARABLES (Real-Time Signals)</b>", ParagraphStyle("TH2", fontName="Helvetica-Bold", fontSize=10, textColor=colors.HexColor("#0066FF"))),
        ],
        [
            Paragraph("• Synthea Electronic Health Records engine.<br/>• Demographics: Age, Gender, BMI.<br/>• Historical Diagnoses: Essential Hypertension, Type 2 Diabetes.<br/>• Lifestyle factors: Tobacco use, Physical activity, Sleep duration.<br/>• Prior lab encounters & medications.", body_style),
            Paragraph("• PhysioNet BIDMC PPG: 125 Hz optical plethysmogram.<br/>• PhysioNet MIT-BIH ECG: 360 Hz Lead MLII recordings.<br/>• Real-time Bluetooth Low Energy (BLE) stream state machine.<br/>• SciPy Butterworth bandpass filtering (0.5–5.0 Hz).<br/>• Heart Rate Variability (HRV) & Signal Quality Index (SQI).", body_style),
        ]
    ]
    st = Table(stream_table, colWidths=[360, 360])
    st.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0effe")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#0066FF")),
        ("PADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(st)
    elements.append(PageBreak())

    # SLIDE 4: Machine Learning & Prediction Outcomes
    elements.append(Paragraph("3. Predictive Models & Clinical Outcomes", slide_title))
    elements.append(Paragraph("Measurable artificial intelligence models deployed in CardioTwin AI", slide_subtitle))
    elements.append(Spacer(1, 14))
    elements.append(Paragraph("• <b>Multimodal Late-Fusion Engine:</b> Synthesizes physiological waveforms (40%), tabular vitals (30%), clinical NLP notes (20%), and report OCR scans (10%) into an interpretable 0–100 Cardiovascular Risk Index.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>PhysioNet MIT-BIH Arrhythmia Classifier:</b> Supervised Random Forest classifier trained on gold-standard beat annotations (N, V, A, L, R). Achieves <b>71.74% overall accuracy</b> and <b>0.599 weighted F1</b> on strictly held-out subject data (zero participant leakage).", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Blood Pressure Trend Forecasting:</b> Detects pre-hypertensive transitions and stage 2 arterial spikes from combined pulse transit metrics and structured vitals.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Explainable AI (XAI) Attribution:</b> Calculates mathematical modality contributions and flags specific clinical warnings rather than functioning as an opaque black box.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Longitudinal SQLite Health Memory:</b> Tracks patient trajectory over time, computing comparative Risk Deltas against prior visits.", bullet_style))
    elements.append(PageBreak())

    # SLIDE 5: Clinician Interactive Dashboard
    elements.append(Paragraph("4. Clinician-Ready Digital Twin Interface", slide_title))
    elements.append(Paragraph("A professional 3-column virtual patient experience", slide_subtitle))
    elements.append(Spacer(1, 14))
    elements.append(Paragraph("• <b>3D Translucent Digital Twin Avatar:</b> Vector SVG cardiac centerpiece featuring animated heart pulse, arterial tree, ribcage vectors, and DNA double-helix motifs.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>4 Interactive Physiological Hotspots:</b><br/>  1. <i>Trigeminal Autonomic:</i> Sinus rhythm & SA node firing.<br/>  2. <i>Posterior Hypothalamus:</i> Autonomic tone & Heart Rate Variability.<br/>  3. <i>Trigeminovascular System:</i> Arterial vascular compliance & BP regulation.<br/>  4. <i>Autonomic Reflex:</i> Capillary microcirculation & SpO2 oxygen saturation.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Doctor Interaction Modules:</b> Real-time vitals wave monitors, complaints documentation with biomedical NLP, checkup schedule timeline, and ReportLab 3.0 stamped medical PDF exporter.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Interactive Guided Tour:</b> Built-in step-by-step onboarding walkthrough with directional pointer arrows, spotlights, and radar beacons for first-time evaluators.", bullet_style))
    elements.append(PageBreak())

    # SLIDE 6: Privacy & DPDP Act Compliance
    elements.append(Paragraph("5. Data Ethics, Privacy & Regulatory Compliance", slide_title))
    elements.append(Paragraph("Navigating healthcare privacy laws (DPDP Act 2023 & HIPAA)", slide_subtitle))
    elements.append(Spacer(1, 14))
    elements.append(Paragraph("• <b>Strict Data Provenance Tagging:</b> Every record in the system is visibly and immutably tagged: <code>OPEN_RESEARCH_DATA</code>, <code>SYNTHETIC_EHR</code>, or <code>AUTHORIZED_PATIENT_DATA</code>.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Zero Silent Mock Data:</b> No fabricated patient profiles or simulated numbers are ever silently presented as genuine human data.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Local Data Persistence:</b> SQLite database runs locally on the clinical machine. No unauthorized data leaves the hospital or user boundary.", bullet_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("• <b>Responsible AI Notice:</b> CardioTwin AI is developed as an educational and research proof-of-concept for the Happiest Health Summit. It is designed to empower clinicians, not replace them.", bullet_style))

    doc.build(elements)
    print(f"Generated Presentation PDF: {pdf_path}")

if __name__ == "__main__":
    generate_architecture_pdf()
    generate_presentation_pdf()
