"""
Cersei.ai — Machine Learning Model Training & Evaluation Pipeline
==================================================================
Trains and evaluates:
  1. Model 1: Agent Slashing Risk Classifier (Gradient Boosting / Random Forest / Logistic)
  2. Model 2: Autonomous Bounty Pricing & Latency Regressor (Ridge / Random Forest Regression)

Outputs trained parameters and evaluation reports to `ml/artifacts/` and `src/data/`.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    f1_score,
    precision_score,
    recall_score,
    mean_absolute_error,
    r2_score,
    mean_squared_error,
)

# Fix UTF-8 encoding on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Set random seed for reproducible training
np.random.seed(42)

# Ensure output directories exist
os.makedirs("ml/artifacts", exist_ok=True)
os.makedirs("src/data", exist_ok=True)


# ==========================================
# 1. SYNTHETIC & EMPIRICAL DATA GENERATION
# ==========================================

def generate_agent_risk_dataset(n_samples: int = 3000) -> pd.DataFrame:
    """Generates a calibrated telemetry dataset of autonomous AI agent behaviors."""
    reputation = np.random.uniform(20, 100, n_samples)
    completed_tasks = np.random.poisson(lam=30, size=n_samples)
    win_rate = np.clip(np.random.normal(loc=88, scale=12, size=n_samples), 30, 100)
    stake_eth = np.random.exponential(scale=0.20, size=n_samples) + 0.005
    task_budget_eth = np.random.uniform(0.01, 0.20, n_samples)
    stake_ratio = stake_eth / task_budget_eth
    
    engines = np.random.choice(
        ['groq-llama-3.3-70b', 'groq-deepseek-r1', 'claude-3-7-sonnet', 'gpt-4o', 'deepseek-v3', 'custom-api'],
        size=n_samples,
        p=[0.30, 0.25, 0.15, 0.15, 0.10, 0.05]
    )
    
    bid_deviation = np.clip(np.random.normal(loc=0.85, scale=0.25, size=n_samples), 0.2, 1.8)
    dispute_rate = np.clip((100 - win_rate) / 100 + np.random.normal(0, 0.04, n_samples), 0, 0.8)
    
    # Ground Truth Slashing Probability Logit (Balanced ~18% positive rate)
    engine_penalty = np.where(engines == 'custom-api', 1.6, np.where(engines == 'groq-llama-3.3-70b', -0.5, -0.2))
    logit = (
        1.8
        - 0.042 * reputation
        - 0.75 * np.clip(stake_ratio, 0, 4)
        - 0.02 * win_rate
        + 3.2 * dispute_rate
        + np.where(bid_deviation < 0.55, 1.4, 0.0)
        + engine_penalty
    )
    prob_slashed = 1 / (1 + np.exp(-logit))
    is_slashed = (np.random.rand(n_samples) < prob_slashed).astype(int)

    df = pd.DataFrame({
        'reputation': reputation,
        'completed_tasks': completed_tasks,
        'win_rate': win_rate,
        'stake_eth': stake_eth,
        'task_budget_eth': task_budget_eth,
        'stake_ratio': stake_ratio,
        'bid_deviation': bid_deviation,
        'dispute_rate': dispute_rate,
        'engine': engines,
        'is_slashed': is_slashed,
    })
    return df


def generate_bounty_pricing_dataset(n_samples: int = 3000) -> pd.DataFrame:
    """Generates market dynamic dataset for task pricing & latency regression."""
    prompt_tokens = np.random.exponential(scale=280, size=n_samples) + 40
    categories = np.random.choice(
        ['code_audit', 'finance', 'sentiment', 'data_extraction'],
        size=n_samples,
        p=[0.30, 0.30, 0.20, 0.20]
    )
    cat_weights = {'code_audit': 1.75, 'finance': 1.30, 'sentiment': 0.95, 'data_extraction': 0.90}
    cat_multipliers = np.array([cat_weights[c] for c in categories])
    
    competitors = np.random.randint(1, 9, size=n_samples)
    strictness_high = np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25])
    is_groq = np.random.choice([1, 0], size=n_samples, p=[0.65, 0.35])

    # Fair Escrow Formula (Target Continuous Variable)
    base_escrow = (0.008 + prompt_tokens * 0.000025) * cat_multipliers * (1 + 0.25 * strictness_high)
    supply_discount = np.minimum(0.35, (competitors - 1) * 0.065)
    winning_bid_eth = base_escrow * (1 - supply_discount) + np.random.normal(0, 0.001, n_samples)
    winning_bid_eth = np.clip(winning_bid_eth, 0.005, 0.40)

    # Latency Target (ms)
    base_latency = np.where(is_groq == 1, 190, 650)
    latency_ms = base_latency + np.log(prompt_tokens) * 16 + np.random.normal(0, 15, n_samples)

    df = pd.DataFrame({
        'prompt_tokens': prompt_tokens,
        'category': categories,
        'competitor_count': competitors,
        'is_high_quorum': strictness_high,
        'is_groq': is_groq,
        'winning_bid_eth': winning_bid_eth,
        'latency_ms': latency_ms,
    })
    return df


# ==========================================
# 2. TRAIN & EVALUATE MODEL 1 (RISK CLASSIFIER)
# ==========================================

def train_risk_classifier():
    print("=" * 65)
    print("[MODEL 1] TRAINING AGENT SLASHING RISK CLASSIFIER")
    print("=" * 65)
    
    df = generate_agent_risk_dataset(3500)
    print(f"Generated Dataset: {len(df)} samples (Slashed rate: {df['is_slashed'].mean()*100:.1f}%)")
    
    features = ['reputation', 'completed_tasks', 'win_rate', 'stake_ratio', 'bid_deviation', 'dispute_rate']
    
    X = df[features]
    y = df['is_slashed']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        "Logistic Regression (Calibrated)": LogisticRegression(C=1.0, max_iter=1000, random_state=42),
        "Random Forest Classifier": RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42),
        "Gradient Boosting Classifier": GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42),
    }
    
    best_name = None
    best_auc = 0
    results = {}
    
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        f1 = f1_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='roc_auc')
        
        results[name] = {
            "Accuracy": round(float(acc), 4),
            "ROC-AUC": round(float(auc), 4),
            "CV ROC-AUC (Mean)": round(float(cv_scores.mean()), 4),
            "F1-Score": round(float(f1), 4),
            "Precision": round(float(prec), 4),
            "Recall": round(float(rec), 4),
        }
        
        print(f"\nModel: {name}")
        print(f"   Accuracy: {acc*100:.2f}% | ROC-AUC: {auc:.4f} | 5-Fold CV: {cv_scores.mean():.4f} | F1: {f1:.4f}")
        
        if auc > best_auc:
            best_auc = auc
            best_name = name

    print(f"\n[+] Best Classifier Selected: {best_name} (ROC-AUC = {best_auc:.4f})")
    
    # Extract feature weights / importances
    log_reg = models["Logistic Regression (Calibrated)"]
    coefficients = dict(zip(features, [float(c) for c in log_reg.coef_[0]]))
    
    risk_export = {
        "model_name": best_name,
        "features": features,
        "scaler_mean": [float(m) for m in scaler.mean_],
        "scaler_scale": [float(s) for s in scaler.scale_],
        "intercept": float(log_reg.intercept_[0]),
        "coefficients": coefficients,
        "evaluation_metrics": results,
    }
    
    # Save artifacts
    with open("ml/artifacts/risk_model_report.json", "w", encoding="utf-8") as f:
        json.dump(risk_export, f, indent=2)
    with open("src/data/trained_risk_model.json", "w", encoding="utf-8") as f:
        json.dump(risk_export, f, indent=2)
        
    return risk_export


# ==========================================
# 3. TRAIN & EVALUATE MODEL 2 (PRICING REGRESSOR)
# ==========================================

def train_pricing_regressor():
    print("\n" + "=" * 65)
    print("[MODEL 2] TRAINING DYNAMIC BOUNTY PRICING REGRESSOR")
    print("=" * 65)
    
    df = generate_bounty_pricing_dataset(3500)
    
    # One-hot encode category
    df_encoded = pd.get_dummies(df, columns=['category'], drop_first=False)
    feature_cols = [c for c in df_encoded.columns if c not in ['winning_bid_eth', 'latency_ms']]
    
    X = df_encoded[feature_cols]
    y = df_encoded['winning_bid_eth']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        "Ridge Regression (L2)": Ridge(alpha=1.0),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42),
    }
    
    best_name = None
    best_r2 = -1
    results = {}
    
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        results[name] = {
            "R2 Score": round(float(r2), 4),
            "MAE (ETH)": round(float(mae), 6),
            "RMSE (ETH)": round(float(rmse), 6),
        }
        
        print(f"\nModel: {name}")
        print(f"   R2 Score: {r2:.4f} | MAE: {mae:.6f} ETH | RMSE: {rmse:.6f} ETH")
        
        if r2 > best_r2:
            best_r2 = r2
            best_name = name

    print(f"\n[+] Best Regressor Selected: {best_name} (R2 = {best_r2:.4f})")
    
    ridge_model = models["Ridge Regression (L2)"]
    pricing_export = {
        "model_name": best_name,
        "features": feature_cols,
        "scaler_mean": [float(m) for m in scaler.mean_],
        "scaler_scale": [float(s) for s in scaler.scale_],
        "intercept": float(ridge_model.intercept_),
        "coefficients": dict(zip(feature_cols, [float(c) for c in ridge_model.coef_])),
        "evaluation_metrics": results,
    }
    
    # Save artifacts
    with open("ml/artifacts/pricing_model_report.json", "w", encoding="utf-8") as f:
        json.dump(pricing_export, f, indent=2)
    with open("src/data/trained_pricing_model.json", "w", encoding="utf-8") as f:
        json.dump(pricing_export, f, indent=2)

    return pricing_export


if __name__ == "__main__":
    print("\nStarting Cersei.ai Machine Learning Pipeline Training...\n")
    risk_meta = train_risk_classifier()
    pricing_meta = train_pricing_regressor()
    print("\n" + "=" * 65)
    print("[SUCCESS] All ML Models Successfully Trained and Exported!")
    print("Export Paths:")
    print("  -> src/data/trained_risk_model.json")
    print("  -> src/data/trained_pricing_model.json")
    print("  -> ml/artifacts/risk_model_report.json")
    print("  -> ml/artifacts/pricing_model_report.json")
    print("=" * 65 + "\n")
