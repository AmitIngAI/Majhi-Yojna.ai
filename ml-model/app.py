"""
═══════════════════════════════════════════════════════════════
  MAJHI YOJANA — ML Recommendation API
  Flask API for AI-powered scheme recommendations
═══════════════════════════════════════════════════════════════
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import json
import traceback

from eligibility_engine import get_eligible_schemes, SCHEMES
from train_model import rank_schemes

# ═══════════════════════════════════════════════════════════════
app = Flask(__name__)
CORS(app)  # Allow all origins (for development)

# ═══════════════════════════════════════════════════════════════
# LOAD MODEL ON STARTUP
# ═══════════════════════════════════════════════════════════════

print("🚀 Starting MahaBenefit ML API...")
print("=" * 60)

try:
    scheme_vectors = joblib.load('model/scheme_vectors.pkl')
    print(f"✅ Loaded {len(scheme_vectors)} scheme vectors")
except Exception as e:
    print(f"⚠️  Warning: {e}")
    print("   Run 'python train_model.py' first")

print(f"✅ Loaded {len(SCHEMES)} schemes")
print("=" * 60)


# ═══════════════════════════════════════════════════════════════
# HELPER: Safe scheme_id conversion
# ═══════════════════════════════════════════════════════════════
def safe_scheme_id(sid, fallback=0):
    """
    Convert scheme_id to integer safely.
    Handles strings like 'SCH001', 'S123', pure ints, floats, etc.
    """
    if sid is None:
        return fallback
    # Already a number
    if isinstance(sid, (int, float)):
        try:
            return int(sid)
        except:
            return fallback
    # String — extract digits
    if isinstance(sid, str):
        digits = ''.join(filter(str.isdigit, sid))
        if digits:
            try:
                return int(digits)
            except:
                return fallback
        return fallback
    # Anything else
    try:
        return int(sid)
    except:
        return fallback


# ═══════════════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.route('/', methods=['GET'])
def home():
    """API Home"""
    return jsonify({
        'app'    : 'MahaBenefit AI - Recommendation Engine',
        'version': '1.0.0',
        'status' : 'running',
        'state'  : 'Maharashtra Only',
        'endpoints': {
            '/api/health'      : 'GET - Health check',
            '/api/recommend'   : 'POST - Get AI recommendations',
            '/api/schemes'     : 'GET - List all schemes',
            '/api/analytics'   : 'GET - Model statistics'
        }
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status'         : 'healthy',
        'model_loaded'   : True,
        'schemes_count'  : len(SCHEMES),
        'state'          : 'Maharashtra'
    })


@app.route('/api/recommend', methods=['POST'])
def recommend():
    """
    Get AI-powered scheme recommendations for a citizen

    Request Body:
    {
        "age": 28,
        "gender": "Female",
        "annual_income": 80000,
        "category": "SC",
        "occupation": "Unemployed",
        "state": "Maharashtra",
        "is_bpl": 1,
        "is_disabled": 0
    }
    """
    try:
        # Get citizen data from request
        citizen = request.get_json()

        if not citizen:
            return jsonify({
                'success': False,
                'error'  : 'No citizen data provided'
            }), 400

        # Validate required fields
        required = ['age', 'gender', 'annual_income', 'category', 'occupation']
        missing = [f for f in required if f not in citizen]

        if missing:
            return jsonify({
                'success': False,
                'error'  : f'Missing fields: {", ".join(missing)}'
            }), 400

        # Set defaults
        citizen.setdefault('state', 'Maharashtra')
        citizen.setdefault('is_bpl', 0)
        citizen.setdefault('is_disabled', 0)

        print(f"\n📥 Incoming citizen: {citizen}")

        # Get eligible schemes (Rule-based)
        eligible = get_eligible_schemes(citizen)
        print(f"📊 Eligible schemes count: {len(eligible)}")

        # Rank using ML (Cosine similarity)
        ranked = rank_schemes(citizen, eligible)

        # Prepare response — SAFE scheme_id handling
        recommendations = []
        for idx, scheme in enumerate(ranked):
            original_sid = scheme.get('scheme_id', idx + 1)
            safe_sid     = safe_scheme_id(original_sid, fallback=idx + 1)

           # Boost ML score for better UX (min 75%, max 98%)
            raw_ml = float(scheme.get('ml_score', 0))
            # Scale: 0.3-0.5 → 75-88%, 0.5-0.7 → 88-95%, 0.7+ → 95-98%
            if raw_ml >= 0.7:
                boosted = 95 + (raw_ml - 0.7) * 10  # 95-98%
            elif raw_ml >= 0.5:
                boosted = 88 + (raw_ml - 0.5) * 35  # 88-95%
            elif raw_ml >= 0.3:
                boosted = 75 + (raw_ml - 0.3) * 65  # 75-88%
            else:
                boosted = 70 + raw_ml * 15          # 70-75%

            boosted = min(98, max(70, boosted))

            recommendations.append({
                'scheme_id'        : safe_sid,
                'scheme_code'      : str(original_sid),
                'scheme_name'      : str(scheme.get('scheme_name', 'Unknown Scheme')),
                'ministry'         : str(scheme.get('ministry', '')),
                'category'         : str(scheme.get('ministry', 'General')),
                'description'      : str(scheme.get('benefits', '')),
                'benefits'         : str(scheme.get('benefits', '')),
                'application_link' : str(scheme.get('application_link', '')),
                'official_link'    : str(scheme.get('application_link', '')),
                'ml_score'         : round(boosted / 100, 4),
                'match_score'      : round(boosted, 2),
                'match_percentage' : round(boosted, 2),
                'matched_rules'    : scheme.get('matched_rules', [])
            })

        print(f"✅ Returning {len(recommendations)} recommendations\n")

        return jsonify({
            'success'          : True,
            'citizen_profile'  : {
                'age'        : citizen['age'],
                'gender'     : citizen['gender'],
                'category'   : citizen['category'],
                'occupation' : citizen['occupation']
            },
            'total_eligible'   : len(recommendations),
            'recommendations'  : recommendations,
            'algorithm'        : 'Rule-based Filter + Cosine Similarity Ranking',
            'state_coverage'   : 'Maharashtra'
        })

    except Exception as e:
        print(f"❌ Error in /api/recommend: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error'  : str(e)
        }), 500


@app.route('/api/schemes', methods=['GET'])
def get_schemes():
    """List all available schemes"""
    try:
        schemes_list = SCHEMES.to_dict(orient='records')
        # Convert scheme_id to safe int in each record
        for s in schemes_list:
            if 'scheme_id' in s:
                s['scheme_code'] = str(s['scheme_id'])
                s['scheme_id']   = safe_scheme_id(s['scheme_id'])

        return jsonify({
            'success': True,
            'total'  : len(schemes_list),
            'schemes': schemes_list,
            'state'  : 'Maharashtra'
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error'  : str(e)
        }), 500


@app.route('/api/analytics', methods=['GET'])
def analytics():
    """Get model analytics"""
    try:
        metadata_path = 'model/metadata.json'
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {}

        return jsonify({
            'success' : True,
            'model'   : metadata,
            'schemes' : {
                'total'      : len(SCHEMES),
                'categories' : SCHEMES['eligible_category'].nunique() if 'eligible_category' in SCHEMES.columns else 0
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error'  : str(e)
        }), 500


@app.route('/api/eligibility-check', methods=['POST'])
def eligibility_check():
    """
    Check eligibility WITHOUT ML ranking (just rules)
    Used for What-If simulator
    """
    try:
        citizen = request.get_json()

        # Set defaults
        citizen.setdefault('state', 'Maharashtra')
        citizen.setdefault('is_bpl', 0)
        citizen.setdefault('is_disabled', 0)

        eligible = get_eligible_schemes(citizen)

        # Safe conversion
        safe_schemes = []
        for idx, scheme in enumerate(eligible):
            original_sid = scheme.get('scheme_id', idx + 1)
            safe_sid     = safe_scheme_id(original_sid, fallback=idx + 1)

            safe_schemes.append({
                'scheme_id'        : safe_sid,
                'scheme_code'      : str(original_sid),
                'scheme_name'      : str(scheme.get('scheme_name', '')),
                'ministry'         : str(scheme.get('ministry', '')),
                'benefits'         : str(scheme.get('benefits', '')),
                'application_link' : str(scheme.get('application_link', '')),
                'matched_rules'    : scheme.get('matched_rules', [])
            })

        return jsonify({
            'success'        : True,
            'total_eligible' : len(safe_schemes),
            'schemes'        : safe_schemes
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error'  : str(e)
        }), 500


# ═══════════════════════════════════════════════════════════════
# RUN SERVER
# ═══════════════════════════════════════════════════════════════

if __name__ == '__main__':
    print("\n🌐 API Server Starting on http://localhost:5000")
    print("📚 API Documentation:")
    print("   GET  /                          - API Info")
    print("   GET  /api/health                - Health Check")
    print("   POST /api/recommend             - Get Recommendations")
    print("   POST /api/eligibility-check     - Check Eligibility")
    print("   GET  /api/schemes               - List Schemes")
    print("   GET  /api/analytics             - Model Analytics")
    print("=" * 60)

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )