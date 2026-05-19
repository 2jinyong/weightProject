from fastapi import FastAPI
from pydantic import BaseModel
import requests
import uvicorn

app = FastAPI()

class UserStats(BaseModel):
    height: float
    weight: float

@app.post("/api/ai-feedback")
async def get_bmi_feedback(data: UserStats):
    # 1. 계산기 역할: 오차 없는 소수점 계산만 수행
    height_m = data.height / 100
    bmi = round(data.weight / (height_m * height_m), 2)

    # 2. 판단과 해석의 전권을 Gemma에게 위임
    # 기준치를 파이썬이 정하지 않고, Gemma의 지식을 활용합니다.
    prompt = f"""
    당신은 세계적인 보건 기구의 기준을 숙지하고 있는 전문 헬스 트레이너입니다.
    
    [사용자 데이터]
    - 키: {data.height}cm
    - 몸무게: {data.weight}kg
    - 계산된 BMI: {bmi}

    위 데이터를 바탕으로 다음 질문에 답해 주세요:
    1. 계산된 BMI {bmi}는 의학적으로 어떤 단계(저체중/정상/비만 등)에 해당하나요?
    2. 이 수치가 성인 평균과 비교했을 때 어느 정도 수준인지, 건강상 주의할 점은 무엇인지 판단해 주세요.
    3. 이 사용자가 '정상 범위'의 건강한 신체를 갖기 위해서 식단과 운동을 시작할 수 있게 권장하는 답변을 해주세요.

    답변은 수치에 대한 엄격한 판단과 따뜻한 조언을 섞어서 한국어로 작성해 주세요.
    """

    try:
        response = requests.post("http://localhost:11434/api/generate", 
        json={
            "model": "gemma2:2b",
            "prompt": prompt,
            "stream": False
        }, timeout=60)
        
        result = response.json().get("response")
        return {
            "bmi": bmi,
            "feedback": result
        }
    except Exception as e:
        return {"error": str(e), "feedback": "AI가 판단을 내리는 중 오류가 발생했습니다."}
    
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)