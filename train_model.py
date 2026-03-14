"""
CodeCure - AI Health-Tech Platform
Diabetes Risk Prediction Model Training Script

This script trains a Logistic Regression model on the Pima Indians Diabetes Dataset.
Since the dataset may not be locally available, we generate a synthetic version
based on the real dataset's statistical properties.
"""

import os
import sys
import io
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ──────────────────────────────────────────────
# Generate Synthetic Dataset (based on Pima Indians Diabetes Dataset statistics)
# ──────────────────────────────────────────────
def generate_synthetic_diabetes_data(n_samples=800):
    """Generate realistic synthetic diabetes data based on Pima dataset distributions."""
    np.random.seed(42)
    
    # Feature distributions based on real Pima dataset
    pregnancies = np.random.poisson(3.8, n_samples).clip(0, 17)
    glucose = np.random.normal(120.9, 32.0, n_samples).clip(44, 199)
    blood_pressure = np.random.normal(69.1, 19.4, n_samples).clip(24, 122)
    skin_thickness = np.random.normal(20.5, 16.0, n_samples).clip(0, 99)
    insulin = np.random.normal(79.8, 115.2, n_samples).clip(0, 846)
    bmi = np.random.normal(32.0, 7.9, n_samples).clip(18.2, 67.1)
    dpf = np.random.exponential(0.47, n_samples).clip(0.08, 2.42)  # Diabetes Pedigree Function
    age = np.random.normal(33.2, 11.8, n_samples).clip(21, 81).astype(int)
    
    # Generate outcome based on realistic risk factors
    risk_score = (
        0.02 * pregnancies +
        0.015 * (glucose - 100) +
        0.005 * (blood_pressure - 70) +
        0.003 * skin_thickness +
        0.001 * insulin +
        0.03 * (bmi - 25) +
        0.5 * dpf +
        0.01 * (age - 30)
    )
    
    # Add noise and convert to binary
    risk_prob = 1 / (1 + np.exp(-risk_score + 1.5))
    outcome = (np.random.random(n_samples) < risk_prob).astype(int)
    
    df = pd.DataFrame({
        'Pregnancies': pregnancies,
        'Glucose': glucose.round(1),
        'BloodPressure': blood_pressure.round(1),
        'SkinThickness': skin_thickness.round(1),
        'Insulin': insulin.round(1),
        'BMI': bmi.round(1),
        'DiabetesPedigreeFunction': dpf.round(3),
        'Age': age,
        'Outcome': outcome
    })
    
    return df


def train_models():
    """Train multiple models and save the best one."""
    
    print("=" * 60)
    print("  CodeCure - AI Diabetes Prediction Model Training")
    print("=" * 60)
    
    # Check for real dataset first, otherwise generate synthetic
    dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "diabetes.csv")
    
    if os.path.exists(dataset_path):
        print("\n[*] Loading real Pima Indians Diabetes Dataset...")
        data = pd.read_csv(dataset_path)
    else:
        print("\n[*] Generating synthetic diabetes dataset...")
        data = generate_synthetic_diabetes_data(800)
        data.to_csv(dataset_path, index=False)
        print(f"    Dataset saved to {dataset_path}")
    
    print(f"\n[i] Dataset Shape: {data.shape}")
    print(f"    Positive Cases: {data['Outcome'].sum()} ({data['Outcome'].mean()*100:.1f}%)")
    print(f"    Negative Cases: {(data['Outcome'] == 0).sum()} ({(data['Outcome'] == 0).mean()*100:.1f}%)")
    
    # Prepare features and target
    X = data.drop("Outcome", axis=1)
    y = data["Outcome"]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train multiple models
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
    }
    
    best_model_name = None
    best_accuracy = 0
    best_model = None
    
    print("\n" + "-" * 60)
    print("  Model Training Results")
    print("-" * 60)
    
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        
        print(f"\n  [MODEL] {name}")
        print(f"     Test Accuracy:  {accuracy:.4f}")
        print(f"     CV Mean:        {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")
        
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_model_name = name
            best_model = model
    
    # Save the best model and scaler
    os.makedirs("model", exist_ok=True)
    
    model_path = os.path.join("model", "diabetes_model.pkl")
    scaler_path = os.path.join("model", "scaler.pkl")
    feature_names_path = os.path.join("model", "feature_names.pkl")
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(list(X.columns), feature_names_path)
    
    print("\n" + "=" * 60)
    print(f"  [OK] Best Model: {best_model_name} (Accuracy: {best_accuracy:.4f})")
    print(f"  [SAVE] Model saved to: {model_path}")
    print(f"  [SAVE] Scaler saved to: {scaler_path}")
    print("=" * 60)
    
    # Print detailed classification report for best model
    y_pred = best_model.predict(X_test_scaled)
    print(f"\n[REPORT] Classification Report ({best_model_name}):")
    print(classification_report(y_test, y_pred, target_names=['No Diabetes', 'Diabetes']))
    
    # Feature importance (if available)
    if hasattr(best_model, 'feature_importances_'):
        print("\n[FEATURES] Feature Importance:")
        importances = sorted(
            zip(X.columns, best_model.feature_importances_),
            key=lambda x: x[1], reverse=True
        )
        for feat, imp in importances:
            bar = "#" * int(imp * 50)
            print(f"   {feat:30s} {imp:.4f} {bar}")
    
    return best_model, scaler


if __name__ == "__main__":
    train_models()
