import streamlit as st
import joblib
import pandas as pd

st.set_page_config(page_title="FemWell - Women's Health Screening", page_icon="🌸")

st.title("🌸 FemWell - Women's Health Screening")
st.write("Select which condition you'd like to check for:")

condition = st.selectbox("Choose a screening", ["PCOS", "Anemia"])

st.divider()

# ---------------- PCOS SECTION ----------------
if condition == "PCOS":
    st.header("PCOS Symptom Checker")
    
    model = joblib.load('PCOS/pcos_svm_model.pkl')
    scaler = joblib.load('PCOS/scaler.pkl')
    columns = joblib.load('PCOS/columns.pkl')
    
    age = st.number_input("Age (years)", min_value=10, max_value=60, value=25)
    weight = st.number_input("Weight (Kg)", min_value=30.0, max_value=150.0, value=60.0)
    height = st.number_input("Height (Cm)", min_value=120.0, max_value=200.0, value=160.0)
    bmi = weight / ((height/100) ** 2)
    st.write(f"Calculated BMI: {bmi:.2f}")
    
    cycle = st.selectbox("Menstrual Cycle", ["Regular", "Irregular"])
    cycle_val = 2 if cycle == "Regular" else 4
    
    cycle_length = st.number_input("Cycle Length (days)", min_value=1, max_value=60, value=28)
    marriage_years = st.number_input("Years since marriage (0 if unmarried)", min_value=0.0, value=0.0)
    pregnant = st.selectbox("Currently Pregnant?", ["No", "Yes"])
    weight_gain = st.selectbox("Sudden Weight Gain?", ["No", "Yes"])
    hair_growth = st.selectbox("Excess Hair Growth (face/body)?", ["No", "Yes"])
    skin_darkening = st.selectbox("Skin Darkening?", ["No", "Yes"])
    hair_loss = st.selectbox("Hair Loss?", ["No", "Yes"])
    pimples = st.selectbox("Pimples/Acne?", ["No", "Yes"])
    fast_food = st.selectbox("Frequent Fast Food Consumption?", ["No", "Yes"])
    exercise = st.selectbox("Regular Exercise?", ["No", "Yes"])
    
    def yn(val):
        return 1 if val == "Yes" else 0
    
    if st.button("Check PCOS Likelihood"):
        input_data = pd.DataFrame([{
            'Age (yrs)': age, 'Weight (Kg)': weight, 'Height(Cm)': height, 'BMI': bmi,
            'Cycle(R/I)': cycle_val, 'Cycle length(days)': cycle_length,
            'Marraige Status (Yrs)': marriage_years, 'Pregnant(Y/N)': yn(pregnant),
            'Weight gain(Y/N)': yn(weight_gain), 'hair growth(Y/N)': yn(hair_growth),
            'Skin darkening (Y/N)': yn(skin_darkening), 'Hair loss(Y/N)': yn(hair_loss),
            'Pimples(Y/N)': yn(pimples), 'Fast food (Y/N)': yn(fast_food),
            'Reg.Exercise(Y/N)': yn(exercise)
        }])
        input_data = input_data[columns]
        input_scaled = scaler.transform(input_data)
        prediction = model.predict(input_scaled)
        
        if prediction[0] == 1:
            st.error("⚠️ PCOS Likely — please consult a gynecologist for proper diagnosis.")
        else:
            st.success("✅ PCOS Unlikely — but if symptoms persist, consult a doctor.")
        st.caption("This is a screening tool, not a medical diagnosis.")

# ---------------- ANEMIA SECTION ----------------
elif condition == "Anemia":
    st.header("Anemia Checker")
    
    model = joblib.load('Anemia/anemia_svm_model.pkl')
    scaler = joblib.load('Anemia/anemia_scaler.pkl')
    columns = joblib.load('Anemia/anemia_columns.pkl')
    
    st.write("Enter values from your recent CBC (Complete Blood Count) report:")
    
    gender = st.selectbox("Gender", ["Female", "Male"])
    gender_val = 0 if gender == "Female" else 1  # apna actual encoding confirm kar lena
    
    hemoglobin = st.number_input("Hemoglobin (g/dL)", min_value=3.0, max_value=20.0, value=13.0)
    mch = st.number_input("MCH", min_value=10.0, max_value=40.0, value=29.0)
    mchc = st.number_input("MCHC", min_value=20.0, max_value=40.0, value=33.0)
    mcv = st.number_input("MCV", min_value=50.0, max_value=120.0, value=90.0)
    
    if st.button("Check Anemia Likelihood"):
        input_data = pd.DataFrame([{
            'Gender': gender_val, 'MCHC': mchc, 'MCV': mcv, 'MCH': mch, 'Hemoglobin': hemoglobin
        }])
        input_data = input_data[columns]
        input_scaled = scaler.transform(input_data)
        prediction = model.predict(input_scaled)
        
        if prediction[0] == 1:
            st.error("⚠️ Anemia Likely — please consult a doctor for confirmation.")
        else:
            st.success("✅ Anemia Unlikely.")
        st.caption("This is a screening tool, not a medical diagnosis.")