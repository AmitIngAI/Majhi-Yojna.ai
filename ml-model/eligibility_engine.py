import pandas as pd
import os

# ─── Load Schemes ─────────────────────────────────────────
def load_schemes():
    path = os.path.join(os.path.dirname(__file__), 'data', 'schemes.csv')
    return pd.read_csv(path)

SCHEMES = load_schemes()

# ─── Check Single Scheme ──────────────────────────────────
def check_eligibility(citizen: dict, scheme: pd.Series):
    matched_rules  = []
    failed_reasons = []

    # 1. State Check — Maharashtra Only
    req_states = str(scheme['applicable_states']).strip()
    if citizen['state'] != 'Maharashtra':
        failed_reasons.append("Not a Maharashtra resident")
        return False, [], failed_reasons
    else:
        matched_rules.append(
            f"✅ You are a Maharashtra resident — scheme is applicable"
        )

    # 2. Age Check
    min_age = scheme['min_age']
    max_age = scheme['max_age']
    age     = int(citizen['age'])

    if pd.notna(min_age) and pd.notna(max_age):
        if age < int(min_age) or age > int(max_age):
            failed_reasons.append(
                f"Age {age} not in required range {int(min_age)}-{int(max_age)}"
            )
        else:
            matched_rules.append(
                f"✅ Your age {age} is within eligible range "
                f"{int(min_age)} to {int(max_age)} years"
            )

    if failed_reasons:
        return False, [], failed_reasons

    # 3. Income Check
    max_income = scheme['max_income']
    income     = int(citizen['annual_income'])

    if pd.notna(max_income):
        if income > int(max_income):
            failed_reasons.append(
                f"Income Rs {income} exceeds limit Rs {int(max_income)}"
            )
        else:
            matched_rules.append(
                f"✅ Your annual income Rs {income} is within "
                f"the limit of Rs {int(max_income)}"
            )

    if failed_reasons:
        return False, [], failed_reasons

    # 4. Gender Check
    req_gender = str(scheme['eligible_gender']).strip()
    if req_gender != 'All':
        if citizen['gender'] != req_gender:
            failed_reasons.append(
                f"Gender {citizen['gender']} does not match: {req_gender}"
            )
        else:
            matched_rules.append(
                f"✅ Gender {citizen['gender']} matches requirement"
            )
    else:
        matched_rules.append(f"✅ Scheme is open to all genders")

    if failed_reasons:
        return False, [], failed_reasons

    # 5. Category Check
    req_category = str(scheme['eligible_category']).strip()
    if req_category != 'All':
        valid_cats = [c.strip() for c in req_category.split()]
        if citizen['category'] not in valid_cats:
            failed_reasons.append(
                f"Category {citizen['category']} not in: {req_category}"
            )
        else:
            matched_rules.append(
                f"✅ Your category {citizen['category']} matches requirement"
            )
    else:
        matched_rules.append(f"✅ Scheme is open to all categories")

    if failed_reasons:
        return False, [], failed_reasons

    # 6. Occupation Check
    req_occ = str(scheme['eligible_occupation']).strip()
    if req_occ != 'All':
        if citizen['occupation'] != req_occ:
            failed_reasons.append(
                f"Occupation {citizen['occupation']} does not match: {req_occ}"
            )
        else:
            matched_rules.append(
                f"✅ Your occupation {citizen['occupation']} matches requirement"
            )
    else:
        matched_rules.append(f"✅ Scheme is open to all occupations")

    if failed_reasons:
        return False, [], failed_reasons

    is_eligible = len(failed_reasons) == 0
    return is_eligible, matched_rules, failed_reasons


# ─── Get All Eligible Schemes ─────────────────────────────
def get_eligible_schemes(citizen: dict):
    eligible_list = []

    for _, scheme in SCHEMES.iterrows():
        is_eligible, matched_rules, failed = check_eligibility(
            citizen, scheme
        )

        if is_eligible:
            eligible_list.append({
                'scheme_id'        : scheme['scheme_id'],
                'scheme_name'      : scheme['scheme_name'],
                'ministry'         : scheme['ministry'],
                'benefits'         : scheme['benefits_description'],
                'application_link' : scheme['application_link'],
                'matched_rules'    : matched_rules,
                'ml_score'         : 0.0
            })

    return eligible_list


# ─── Test ─────────────────────────────────────────────────
if __name__ == '__main__':
    test_citizen = {
        'age'            : 32,
        'gender'         : 'Male',
        'annual_income'  : 150000,
        'category'       : 'OBC',
        'occupation'     : 'Farmer',
        'state'          : 'Maharashtra',
        'is_bpl'         : 1,
        'is_disabled'    : 0
    }

    print("👤 Test Citizen:")
    print(f"   Age: {test_citizen['age']} | Gender: {test_citizen['gender']}")
    print(f"   Income: Rs {test_citizen['annual_income']}")
    print(f"   Category: {test_citizen['category']}")
    print(f"   Occupation: {test_citizen['occupation']}")
    print(f"   State: {test_citizen['state']}")

    results = get_eligible_schemes(test_citizen)

    print(f"\n✅ Total Eligible Schemes: {len(results)}\n")
    for r in results:
        print(f"📌 {r['scheme_name']}")
        for rule in r['matched_rules']:
            print(f"   {rule}")
        print()