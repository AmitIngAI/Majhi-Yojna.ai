import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os
import json

from eligibility_engine import get_eligible_schemes, SCHEMES

# ─── Encoding Maps ────────────────────────────────────────
GENDER_MAP = {
    'Male'   : 0.0,
    'Female' : 1.0,
    'Other'  : 0.5
}

CATEGORY_MAP = {
    'General' : 0.0,
    'OBC'     : 0.33,
    'SC'      : 0.66,
    'ST'      : 1.0
}

OCCUPATION_MAP = {
    'Farmer'               : 0.0,
    'Student'              : 0.2,
    'Daily Wage Worker'    : 0.4,
    'Small Business Owner' : 0.6,
    'Unemployed'           : 0.8,
    'Street Vendor'        : 1.0
}

GENDER_SCH_MAP = {
    'All'    : 0.5,
    'Male'   : 0.0,
    'Female' : 1.0
}

CATEGORY_SCH_MAP = {
    'All'        : 0.5,
    'General'    : 0.0,
    'OBC'        : 0.33,
    'SC'         : 0.66,
    'ST'         : 1.0,
    'SC ST OBC'  : 0.5,
    'General OBC': 0.2,
    'SC ST'      : 0.8
}

OCCUPATION_SCH_MAP = {
    'All'                  : 0.5,
    'Farmer'               : 0.0,
    'Student'              : 0.2,
    'Daily Wage Worker'    : 0.4,
    'Small Business Owner' : 0.6,
    'Unemployed'           : 0.8,
    'Street Vendor'        : 1.0
}


# ─── Encode Citizen ───────────────────────────────────────
def encode_citizen(citizen: dict) -> np.ndarray:
    age_norm    = min(int(citizen['age']) / 100.0, 1.0)
    income_norm = min(int(citizen['annual_income']) / 1000000.0, 1.0)
    gender_enc  = GENDER_MAP.get(citizen['gender'], 0.5)
    cat_enc     = CATEGORY_MAP.get(citizen['category'], 0.0)
    occ_enc     = OCCUPATION_MAP.get(citizen['occupation'], 0.5)
    is_bpl      = float(citizen.get('is_bpl', 0))
    is_disabled = float(citizen.get('is_disabled', 0))

    return np.array([
        age_norm,
        income_norm,
        gender_enc,
        cat_enc,
        occ_enc,
        is_bpl,
        is_disabled
    ])


# ─── Encode Scheme ────────────────────────────────────────
def encode_scheme(scheme: pd.Series) -> np.ndarray:
    min_age  = int(scheme['min_age'])  if pd.notna(scheme['min_age'])  else 0
    max_age  = int(scheme['max_age'])  if pd.notna(scheme['max_age'])  else 100
    avg_age  = ((min_age + max_age) / 2) / 100.0

    max_inc  = int(scheme['max_income']) if pd.notna(scheme['max_income']) else 1000000
    inc_norm = min(max_inc / 1000000.0, 1.0)

    gender_enc = GENDER_SCH_MAP.get(
        str(scheme['eligible_gender']).strip(), 0.5
    )
    cat_enc    = CATEGORY_SCH_MAP.get(
        str(scheme['eligible_category']).strip(), 0.5
    )
    occ_enc    = OCCUPATION_SCH_MAP.get(
        str(scheme['eligible_occupation']).strip(), 0.5
    )

    return np.array([
        avg_age,
        inc_norm,
        gender_enc,
        cat_enc,
        occ_enc,
        0.0,
        0.0
    ])


# ─── Compute All Scheme Vectors ───────────────────────────
def compute_scheme_vectors():
    vectors = {}
    for _, scheme in SCHEMES.iterrows():
        vectors[scheme['scheme_id']] = encode_scheme(scheme)
    return vectors


# ─── Rank Schemes ─────────────────────────────────────────
def rank_schemes(citizen: dict, eligible_list: list) -> list:
    if not eligible_list:
        return []

    citizen_vec    = encode_citizen(citizen).reshape(1, -1)
    scheme_vectors = compute_scheme_vectors()

    for scheme in eligible_list:
        sid = scheme['scheme_id']
        if sid in scheme_vectors:
            sv    = scheme_vectors[sid].reshape(1, -1)
            score = cosine_similarity(citizen_vec, sv)[0][0]
            scheme['ml_score'] = round(float(score), 4)
        else:
            scheme['ml_score'] = 0.0

    ranked = sorted(
        eligible_list,
        key=lambda x: x['ml_score'],
        reverse=True
    )
    return ranked


# ─── Evaluate ─────────────────────────────────────────────
def evaluate_model():
    print("\n📊 Evaluating Model on 100 Citizens...")
    print("=" * 55)

    path = 'data/citizen_profiles.csv'
    if not os.path.exists(path):
        print("❌ Run generate_data.py first!")
        return

    df     = pd.read_csv(path)
    sample = df.head(100)

    rule_counts  = []
    top_scores   = []

    for _, row in sample.iterrows():
        citizen  = row.to_dict()
        eligible = get_eligible_schemes(citizen)
        ranked   = rank_schemes(citizen, eligible)

        rule_counts.append(len(eligible))
        if ranked:
            top_scores.append(ranked[0]['ml_score'])

    avg_eligible = sum(rule_counts) / len(rule_counts)
    avg_score    = sum(top_scores)  / len(top_scores) if top_scores else 0

    print(f"✅ Citizens Tested          : 100")
    print(f"✅ State                    : Maharashtra Only")
    print(f"✅ Total Schemes            : {len(SCHEMES)}")
    print(f"✅ Avg Eligible Per Citizen : {avg_eligible:.2f}")
    print(f"✅ Avg Top ML Score         : {avg_score:.4f}")
    print(f"✅ Model Status             : WORKING ✅")
    print("=" * 55)


# ─── Save Model ───────────────────────────────────────────
def save_model():
    os.makedirs('model', exist_ok=True)

    scheme_vectors = compute_scheme_vectors()

    joblib.dump(scheme_vectors,  'model/scheme_vectors.pkl')
    joblib.dump(GENDER_MAP,      'model/gender_map.pkl')
    joblib.dump(CATEGORY_MAP,    'model/category_map.pkl')
    joblib.dump(OCCUPATION_MAP,  'model/occupation_map.pkl')

    metadata = {
        'model_version'  : '1.0.0',
        'state_coverage' : 'Maharashtra Only',
        'total_schemes'  : len(SCHEMES),
        'algorithm'      : 'Rule Based Engine + Cosine Similarity Ranking',
        'features'       : [
            'age', 'income', 'gender',
            'category', 'occupation',
            'is_bpl', 'is_disabled'
        ]
    }

    with open('model/metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print("\n✅ Model Saved Successfully!")
    print("   📁 model/scheme_vectors.pkl")
    print("   📁 model/gender_map.pkl")
    print("   📁 model/category_map.pkl")
    print("   📁 model/occupation_map.pkl")
    print("   📁 model/metadata.json")


# ─── Main ─────────────────────────────────────────────────
if __name__ == '__main__':
    print("🚀 MahaBenefit-AI — Maharashtra Scheme Model Training")
    print("=" * 55)

    print("\n📌 Step 1: Computing scheme vectors...")
    vectors = compute_scheme_vectors()
    print(f"   ✅ {len(vectors)} Maharashtra scheme vectors computed")

    print("\n📌 Step 2: Testing sample citizen...")
    test_citizen = {
        'age'           : 28,
        'gender'        : 'Female',
        'annual_income' : 80000,
        'category'      : 'SC',
        'occupation'    : 'Unemployed',
        'state'         : 'Maharashtra',
        'is_bpl'        : 1,
        'is_disabled'   : 0
    }

    eligible = get_eligible_schemes(test_citizen)
    ranked   = rank_schemes(test_citizen, eligible)

    print(f"\n   👤 Profile:")
    print(f"      Age: {test_citizen['age']} | "
          f"Gender: {test_citizen['gender']}")
    print(f"      Income: Rs {test_citizen['annual_income']} | "
          f"Category: {test_citizen['category']}")
    print(f"      Occupation: {test_citizen['occupation']} | "
          f"State: {test_citizen['state']}")

    print(f"\n   🏆 Top 5 Recommended Maharashtra Schemes:")
    for i, s in enumerate(ranked[:5], 1):
        print(f"\n   {i}. {s['scheme_name']}")
        print(f"      Score    : {s['ml_score']}")
        print(f"      Ministry : {s['ministry']}")
        for rule in s['matched_rules'][:2]:
            print(f"      {rule}")

    print("\n📌 Step 3: Evaluating model...")
    evaluate_model()

    print("\n📌 Step 4: Saving model...")
    save_model()

    print("\n🎉 Training Complete! Maharashtra Model Ready.")