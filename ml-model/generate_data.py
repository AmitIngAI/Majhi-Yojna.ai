import pandas as pd
import random
from faker import Faker
import os

fake = Faker('en_IN')
random.seed(42)

# ─── Maharashtra Only ──────────────────────────────────────
STATES = ['Maharashtra']

DISTRICTS = [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad',
    'Solapur', 'Amravati', 'Kolhapur', 'Thane', 'Satara',
    'Sangli', 'Ahmednagar', 'Jalgaon', 'Latur', 'Nanded',
    'Osmanabad', 'Beed', 'Buldhana', 'Akola', 'Yavatmal'
]

CATEGORIES   = ['SC', 'ST', 'OBC', 'General']
OCCUPATIONS  = [
    'Farmer', 'Student', 'Daily Wage Worker',
    'Small Business Owner', 'Unemployed', 'Street Vendor'
]
GENDERS = ['Male', 'Female']

# ─── Generate Profiles ────────────────────────────────────
def generate_profiles(n=1000):
    profiles = []

    for i in range(n):
        age        = random.randint(16, 75)
        gender     = random.choice(GENDERS)
        income     = random.randint(20000, 800000)
        category   = random.choice(CATEGORIES)
        occupation = random.choice(OCCUPATIONS)
        district   = random.choice(DISTRICTS)

        is_bpl      = 1 if income < 120000 else 0
        is_disabled = 1 if random.random() < 0.08 else 0
        has_land    = 1 if occupation == 'Farmer' and random.random() < 0.7 else 0

        profiles.append({
            'citizen_id'            : f'MH{i+1:04d}',
            'name'                  : fake.name(),
            'age'                   : age,
            'gender'                : gender,
            'annual_income'         : income,
            'category'              : category,
            'occupation'            : occupation,
            'state'                 : 'Maharashtra',
            'district'              : district,
            'is_bpl'                : is_bpl,
            'is_disabled'           : is_disabled,
            'has_agricultural_land' : has_land
        })

    return pd.DataFrame(profiles)

# ─── Main ─────────────────────────────────────────────────
if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    df = generate_profiles(1000)
    df.to_csv('data/citizen_profiles.csv', index=False)

    print(f"✅ {len(df)} Maharashtra citizen profiles generated!")
    print(f"📁 Saved to: data/citizen_profiles.csv")
    print(f"\n📊 Sample:")
    print(df.head(3))
    print(f"\n📈 Statistics:")
    print(f"   State      : Maharashtra Only ✅")
    print(f"   Gender     : {df['gender'].value_counts().to_dict()}")
    print(f"   Category   : {df['category'].value_counts().to_dict()}")
    print(f"   Occupation : {df['occupation'].value_counts().to_dict()}")
    print(f"   BPL        : {df['is_bpl'].sum()} citizens")
    print(f"   Disabled   : {df['is_disabled'].sum()} citizens")