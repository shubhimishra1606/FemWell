from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
import joblib
import pandas as pd
from database import engine, Base, get_db
import models_db
from sqlalchemy.orm import Session
import auth
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app=FastAPI(title='FemWell API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pcos_model=joblib.load('PCOS/pcos_svm_model.pkl')
pcos_scaler=joblib.load('PCOS/scaler.pkl')
pcos_columns=joblib.load('PCOS/columns.pkl')

anemia_model=joblib.load('Anemia/anemia_svm_model.pkl')
anemia_scaler=joblib.load('Anemia/anemia_scaler.pkl')
anemia_columns=joblib.load('Anemia/anemia_columns.pkl')

class SignupInput(BaseModel):
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class PCOSInput(BaseModel):
    age: int
    weight: float
    height: float
    cycle_regular: bool
    cycle_length: float
    marriage_years: float
    pregnant: bool
    weight_gain: bool
    hair_growth: bool
    skin_darkening: bool
    hair_loss: bool
    pimples: bool
    fast_food: bool
    exercise: bool

class AnemiaInput(BaseModel):
    gender: int
    hemoglobin: float
    mch: float
    mchc: float
    mcv: float

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(models_db.User).filter(models_db.User.email == payload.get("sub")).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


@app.get('/')
def home():
    return {"message": "Welcome to FemWell API"}

@app.post('/predict/pcos')
def predict_pcos(data: PCOSInput, current_user: models_db.User=Depends(get_current_user), db: Session=Depends(get_db)):
    bmi=data.weight / ((data.height/100) ** 2)
    cycle_val=2 if data.cycle_regular else 4

    input_df=pd.DataFrame([{
        'Age (yrs)': data.age,
        'Weight (Kg)': data.weight,
        'Height(Cm)': data.height,
        'BMI': bmi,
        'Cycle(R/I)': cycle_val,
        'Cycle length(days)': data.cycle_length,
        'Marraige Status (Yrs)': data.marriage_years,
        'Pregnant(Y/N)': int(data.pregnant),
        'Weight gain(Y/N)': int(data.weight_gain),
        'hair growth(Y/N)': int(data.hair_growth),
        'Skin darkening (Y/N)': int(data.skin_darkening),
        'Hair loss(Y/N)': int(data.hair_loss),
        'Pimples(Y/N)': int(data.pimples),
        'Fast food (Y/N)': int(data.fast_food),
        'Reg.Exercise(Y/N)': int(data.exercise)
    }])

    input_df=input_df[pcos_columns]
    input_scaled=pcos_scaler.transform(input_df)
    prediction=pcos_model.predict(input_scaled)[0]
    score=pcos_model.decision_function(input_scaled)[0]

    result_text = "PCOS Likely" if prediction == 1 else "PCOS Unlikely"
    
    history_entry = models_db.PredictionHistory(
        user_id=current_user.id,
        condition_type="PCOS",
        result=result_text,
        confidence_score=float(score)
    )
    db.add(history_entry)
    db.commit()

    return{
        "prediction": "PCOS Likely" if prediction==1 else "PCOS Unlikely",
        "confidence_score": round(float(score),3)
    }


@app.post("/predict/anemia")
def predict_anemia(data: AnemiaInput, current_user: models_db.User = Depends(get_current_user), db: Session = Depends(get_db)):
    input_df = pd.DataFrame([{
        'Gender': data.gender,
        'MCHC': data.mchc,
        'MCV': data.mcv,
        'MCH': data.mch,
        'Hemoglobin': data.hemoglobin
    }])
    
    input_df = input_df[anemia_columns]
    input_scaled = anemia_scaler.transform(input_df)
    prediction = anemia_model.predict(input_scaled)[0]
    score = anemia_model.decision_function(input_scaled)[0]
    
    result_text = "Anemia Likely" if prediction == 1 else "Anemia Unlikely"

    history_entry = models_db.PredictionHistory(
        user_id=current_user.id,
        condition_type="Anemia",
        result=result_text,
        confidence_score=float(score)
    )
    db.add(history_entry)
    db.commit()
    
    return {
        "prediction": result_text,
        "confidence_score": round(float(score), 3)
    }

@app.post('/signup')
def signup(data: SignupInput, db: Session=Depends(get_db)):
    existing_user=db.query(models_db.User).filter(models_db.User.email==data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = auth.hash_password(data.password)
    new_user = models_db.User(email=data.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models_db.User).filter(models_db.User.email == form_data.username).first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email, "user_id": user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}