"""
Seed InterSystems IRIS with Precura patient data.

Usage:
  python seed_iris.py

Prerequisites:
  pip install requests
  Docker container running: docker run -d --name iris-comm -p 1972:1972 -p 52773:52773 \
    -e IRIS_PASSWORD=demo -e IRIS_USERNAME=demo intersystemsdc/iris-community:latest
"""

import requests
import json
from base64 import b64encode

IRIS_URL = "http://localhost:52773/api/sql/USER"
AUTH_HEADER = "Basic " + b64encode(b"demo:demo").decode()
HEADERS = {"Content-Type": "application/json", "Authorization": AUTH_HEADER}


def sql(query: str, params: list = None):
    body = {"query": query}
    if params:
        body["parameters"] = params
    try:
        r = requests.post(IRIS_URL, headers=HEADERS, json=body, timeout=10)
        data = r.json()
        errors = data.get("result", {}).get("status", {}) or data.get("status", {})
        if isinstance(errors, dict) and errors.get("errors"):
            print(f"  SQL error: {errors['errors']}")
        return data
    except Exception as e:
        print(f"  Request failed: {e}")
        return {}


def drop_and_create():
    tables = [
        "SQLUser.PatientSymptoms",
        "SQLUser.PGxMarkers",
        "SQLUser.GenomicMarkers",
        "SQLUser.LabValues",
        "SQLUser.DiseaseHistory",
        "SQLUser.Patients",
    ]
    for t in tables:
        sql(f"DROP TABLE {t}")  # ignore errors if table doesn't exist

    print("Creating tables...")
    sql("""
        CREATE TABLE SQLUser.Patients (
            PatientID     VARCHAR(50),
            PatientLabel  VARCHAR(100),
            Description   VARCHAR(2000),
            PriorTreatmentFailure INT
        )
    """)
    sql("""
        CREATE TABLE SQLUser.PatientSymptoms (
            PatientID VARCHAR(50),
            Symptom   VARCHAR(500)
        )
    """)
    sql("""
        CREATE TABLE SQLUser.PGxMarkers (
            PatientID VARCHAR(50),
            Gene      VARCHAR(50),
            Phenotype VARCHAR(50)
        )
    """)
    sql("""
        CREATE TABLE SQLUser.GenomicMarkers (
            PatientID   VARCHAR(50),
            MarkerKey   VARCHAR(50),
            MarkerValue VARCHAR(50)
        )
    """)
    sql("""
        CREATE TABLE SQLUser.LabValues (
            PatientID      VARCHAR(50),
            BiomarkerKey   VARCHAR(50),
            Category       VARCHAR(20),
            DisplayValue   VARCHAR(100),
            Unit           VARCHAR(50)
        )
    """)
    sql("""
        CREATE TABLE SQLUser.DiseaseHistory (
            PatientID        VARCHAR(50),
            DiseaseDomain    VARCHAR(50),
            ConditionSubtype VARCHAR(50)
        )
    """)
    print("Tables created.\n")


# ── Patient data (mirrors lib/data/samplePatients.ts) ──────────────────────

PATIENTS = [
    {
        "id": "marcus-t",
        "label": "Marcus T., 68M",
        "description": "Retired engineer with established CAD and a recent TIA. CYP2C19 poor metabolizer and SLCO1B1 high-risk carrier — clopidogrel is contraindicated across both conditions. High LDL and CRP drive intensive statin need.",
        "prior_failure": 0,
        "symptoms": [
            "chest pain on exertion",
            "shortness of breath on exertion",
            "transient left-sided weakness (resolved)",
            "elevated blood pressure",
        ],
        "pgx": {"cyp2c19": "poor", "slco1b1": "high"},
        "genomic": {},
        "labs": {
            "crp":          {"category": "high",   "value": "8.4",       "unit": "mg/L"},
            "ldl":          {"category": "high",   "value": "168",       "unit": "mg/dL"},
            "inflammatory": {"category": "high",   "value": "IL-6: 14.2","unit": "pg/mL"},
            "recovery":     {"category": "medium", "value": "BDNF: 18.3","unit": "ng/mL"},
        },
    },
    {
        "id": "james-r",
        "label": "James R., 45M",
        "description": "Software engineer with stage 1 hypertension and elevated LDL at routine checkup. Normal CYP2C19 and SLCO1B1 — no pharmacogenomic contraindications.",
        "prior_failure": 0,
        "symptoms": [
            "elevated blood pressure at routine checkup",
            "fatigue",
            "occasional headaches",
        ],
        "pgx": {"cyp2c19": "normal", "slco1b1": "low"},
        "genomic": {},
        "labs": {
            "crp": {"category": "medium", "value": "2.1", "unit": "mg/L"},
            "ldl": {"category": "high",   "value": "142", "unit": "mg/dL"},
        },
    },
    {
        "id": "elena-v",
        "label": "Elena V., 72F",
        "description": "Retired teacher with atrial fibrillation and hypertension. CYP2C19 intermediate metabolizer and SLCO1B1 high-risk carrier. Elevated CRP and LDL.",
        "prior_failure": 0,
        "symptoms": [
            "palpitations",
            "irregular heartbeat",
            "elevated blood pressure",
            "occasional dizziness",
        ],
        "pgx": {"cyp2c19": "intermediate", "slco1b1": "high"},
        "genomic": {},
        "labs": {
            "crp": {"category": "high", "value": "5.7", "unit": "mg/L"},
            "ldl": {"category": "high", "value": "155", "unit": "mg/dL"},
        },
    },
    {
        "id": "robert-k",
        "label": "Robert K., 58M",
        "description": "Construction worker post-ischemic stroke with elevated inflammatory markers. Normal CYP2C19 — clopidogrel is viable.",
        "prior_failure": 0,
        "symptoms": [
            "sudden right-sided weakness (resolved)",
            "facial drooping (resolved)",
            "elevated blood pressure",
        ],
        "pgx": {"cyp2c19": "normal", "slco1b1": "low"},
        "genomic": {},
        "labs": {
            "crp":          {"category": "high", "value": "6.9",       "unit": "mg/L"},
            "ldl":          {"category": "high", "value": "138",       "unit": "mg/dL"},
            "inflammatory": {"category": "high", "value": "IL-6: 11.8","unit": "pg/mL"},
            "recovery":     {"category": "high", "value": "BDNF: 28.4","unit": "ng/mL"},
        },
    },
    {
        "id": "fatima-a",
        "label": "Fatima A., 63F",
        "description": "Nurse with TIA and hypertension. CYP2C19 poor metabolizer — clopidogrel must be avoided (FDA black box). Aspirin pathway preferred.",
        "prior_failure": 0,
        "symptoms": [
            "transient vision loss (resolved)",
            "brief episode of slurred speech",
            "elevated blood pressure",
            "headaches",
        ],
        "pgx": {"cyp2c19": "poor", "slco1b1": "low"},
        "genomic": {},
        "labs": {
            "crp":          {"category": "medium", "value": "2.8",       "unit": "mg/L"},
            "ldl":          {"category": "high",   "value": "149",       "unit": "mg/dL"},
            "inflammatory": {"category": "high",   "value": "IL-6: 9.4", "unit": "pg/mL"},
            "recovery":     {"category": "high",   "value": "BDNF: 31.2","unit": "ng/mL"},
        },
    },
    {
        "id": "diana-k",
        "label": "Diana K., 54F",
        "description": "Primary school teacher with ER-positive, HER2-negative breast cancer alongside hypertension. CYP2D6 poor metabolizer — tamoxifen cannot produce effective endoxifen and must be avoided.",
        "prior_failure": 0,
        "symptoms": [
            "breast lump detected on self-exam",
            "elevated blood pressure",
            "fatigue",
            "persistent headaches",
        ],
        "pgx": {"cyp2d6": "poor", "cyp2c19": "normal", "slco1b1": "low"},
        "genomic": {"her2": "negative", "er": "positive"},
        "labs": {
            "ca153": {"category": "high",   "value": "52.3", "unit": "U/mL"},
            "crp":   {"category": "medium", "value": "2.4",  "unit": "mg/L"},
            "ldl":   {"category": "high",   "value": "136",  "unit": "mg/dL"},
        },
    },
    {
        "id": "sarah-o",
        "label": "Sarah O., 61F",
        "description": "Retired nurse with HER2-positive, ER-negative breast cancer presenting alongside an acute ischemic stroke. CYP2C19 poor metabolizer — clopidogrel contraindicated.",
        "prior_failure": 0,
        "symptoms": [
            "breast mass on mammogram",
            "sudden right-sided weakness",
            "speech difficulty (aphasia)",
            "facial drooping",
        ],
        "pgx": {"cyp2c19": "poor", "cyp2d6": "normal"},
        "genomic": {"her2": "positive", "er": "negative"},
        "labs": {
            "ca153":        {"category": "high", "value": "74.1",       "unit": "U/mL"},
            "crp":          {"category": "high", "value": "7.2",        "unit": "mg/L"},
            "inflammatory": {"category": "high", "value": "IL-6: 16.3", "unit": "pg/mL"},
            "recovery":     {"category": "medium","value": "BDNF: 21.7","unit": "ng/mL"},
        },
    },
    {
        "id": "amara-n",
        "label": "Amara N., 47F",
        "description": "Accountant with ER-positive, HER2-positive breast cancer. Normal CYP2D6 — tamoxifen produces adequate endoxifen. Elevated CA 15-3.",
        "prior_failure": 0,
        "symptoms": [
            "breast lump on mammogram",
            "nipple discharge",
            "axillary lymph node swelling",
        ],
        "pgx": {"cyp2d6": "normal"},
        "genomic": {"her2": "positive", "er": "positive"},
        "labs": {
            "ca153": {"category": "high", "value": "61.8", "unit": "U/mL"},
            "crp":   {"category": "high", "value": "4.9",  "unit": "mg/L"},
        },
    },
    {
        "id": "priya-m",
        "label": "Priya M., 51F",
        "description": "Pharmacist with ER-positive, HER2-negative breast cancer. CYP2D6 intermediate metabolizer — tamoxifen yields ~50% of normal endoxifen. Prior chemotherapy failure.",
        "prior_failure": 1,
        "symptoms": ["breast pain", "breast lump", "fatigue"],
        "pgx": {"cyp2d6": "intermediate"},
        "genomic": {"her2": "negative", "er": "positive"},
        "labs": {
            "ca153": {"category": "high",   "value": "44.6", "unit": "U/mL"},
            "crp":   {"category": "medium", "value": "1.9",  "unit": "mg/L"},
        },
    },
    {
        "id": "chen-w",
        "label": "Chen W., 55M",
        "description": "CAD with prior stent placement. CYP2C19 ultrarapid metabolizer — clopidogrel is metabolized faster, potentially shortening efficacy. High LDL drives intensive statin.",
        "prior_failure": 1,
        "symptoms": [
            "chest tightness on exertion",
            "shortness of breath",
            "prior cardiac stent placement",
        ],
        "pgx": {"cyp2c19": "ultrarapid", "slco1b1": "low"},
        "genomic": {},
        "labs": {
            "crp": {"category": "medium", "value": "2.2", "unit": "mg/L"},
            "ldl": {"category": "high",   "value": "161", "unit": "mg/dL"},
        },
    },
    {
        "id": "lena-b",
        "label": "Lena B., 38F",
        "description": "Marketing manager with major depressive disorder. CYP2C19 poor metabolizer — escitalopram exposure elevated with FDA-flagged QT risk. Sertraline preferred.",
        "prior_failure": 0,
        "symptoms": [
            "persistent sadness and low mood",
            "loss of interest in daily activities",
            "insomnia",
            "poor concentration",
            "fatigue",
        ],
        "pgx": {"cyp2c19": "poor", "cyp2d6": "normal"},
        "genomic": {},
        "labs": {},
    },
    {
        "id": "david-o",
        "label": "David O., 44M",
        "description": "Teacher with treatment-resistant depression and anxiety. CYP2D6 poor metabolizer — fluoxetine and amitriptyline carry high toxicity risk. Prior SSRI failure.",
        "prior_failure": 1,
        "symptoms": [
            "persistent sadness and low mood",
            "anhedonia",
            "sleep disturbance",
            "anxiety",
            "hopelessness",
            "poor concentration",
        ],
        "pgx": {"cyp2d6": "poor", "cyp2c19": "normal"},
        "genomic": {},
        "labs": {},
    },
]

# ── Disease history (confirmed diagnoses per patient) ──────────────────────

DISEASE_HISTORY = {
    "marcus-t": [
        {"domain": "cardiovascular", "subtype": "cad"},
        {"domain": "stroke",         "subtype": "tia"},
    ],
    "james-r": [
        {"domain": "cardiovascular", "subtype": "hypertension"},
    ],
    "elena-v": [
        {"domain": "cardiovascular", "subtype": "atrial_fibrillation"},
    ],
    "robert-k": [
        {"domain": "stroke", "subtype": "ischemic"},
    ],
    "fatima-a": [
        {"domain": "cardiovascular", "subtype": "hypertension"},
        {"domain": "stroke",         "subtype": "tia"},
    ],
    "diana-k": [
        {"domain": "breastCancer",   "subtype": None},
        {"domain": "cardiovascular", "subtype": "hypertension"},
    ],
    "sarah-o": [
        {"domain": "breastCancer", "subtype": None},
        {"domain": "stroke",       "subtype": "ischemic"},
    ],
    "amara-n": [
        {"domain": "breastCancer", "subtype": None},
    ],
    "priya-m": [
        {"domain": "breastCancer", "subtype": None},
    ],
    "chen-w": [
        {"domain": "cardiovascular", "subtype": "cad"},
    ],
    "lena-b": [
        {"domain": "depression", "subtype": None},
    ],
    "david-o": [
        {"domain": "depression", "subtype": None},
    ],
}


def seed_patients():
    print("Seeding patients...")
    for p in PATIENTS:
        # Patients
        sql(
            "INSERT INTO SQLUser.Patients (PatientID, PatientLabel, Description, PriorTreatmentFailure) VALUES (?,?,?,?)",
            [p["id"], p["label"], p["description"], p["prior_failure"]],
        )
        # Symptoms
        for s in p["symptoms"]:
            sql(
                "INSERT INTO SQLUser.PatientSymptoms (PatientID, Symptom) VALUES (?,?)",
                [p["id"], s],
            )
        # PGx markers
        for gene, phenotype in p["pgx"].items():
            sql(
                "INSERT INTO SQLUser.PGxMarkers (PatientID, Gene, Phenotype) VALUES (?,?,?)",
                [p["id"], gene, phenotype],
            )
        # Genomic markers
        for key, val in p["genomic"].items():
            sql(
                "INSERT INTO SQLUser.GenomicMarkers (PatientID, MarkerKey, MarkerValue) VALUES (?,?,?)",
                [p["id"], key, val],
            )
        # Lab values
        for bkey, bdata in p["labs"].items():
            sql(
                "INSERT INTO SQLUser.LabValues (PatientID, BiomarkerKey, Category, DisplayValue, Unit) VALUES (?,?,?,?,?)",
                [p["id"], bkey, bdata["category"], bdata["value"], bdata["unit"]],
            )
        # Disease history
        for d in DISEASE_HISTORY.get(p["id"], []):
            sql(
                "INSERT INTO SQLUser.DiseaseHistory (PatientID, DiseaseDomain, ConditionSubtype) VALUES (?,?,?)",
                [p["id"], d["domain"], d["subtype"] or ""],
            )
        print(f"  ✓ {p['label']}")
    print(f"\nSeeded {len(PATIENTS)} patients.\n")


def verify():
    result = sql("SELECT COUNT(*) AS Total FROM SQLUser.Patients")
    content = result.get("result", {}).get("content", [])
    if content:
        print(f"Verification: {content[0].get('Total', '?')} patients in IRIS.")
    else:
        print("Verification query returned no results — check IRIS connection.")


if __name__ == "__main__":
    print("=== Precura IRIS Seeder ===\n")
    drop_and_create()
    seed_patients()
    verify()
    print("\nDone. IRIS is ready.")
    print("Management Portal: http://localhost:52773/csp/sys/UtilHome.csp (demo/demo)")
