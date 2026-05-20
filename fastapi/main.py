from fastapi import FastAPI
from pydantic import BaseModel
import requests
import uvicorn

app = FastAPI()

# 프론트에서 어떤 페이지/버튼인지 type을 추가로 받습니다.
class UserStats(BaseModel):
    height: float
    weight: float
    type: str = "all" # 기본값은 "all" (종합 분석)

@app.post("/api/ai-feedback")
async def get_bmi_feedback(data: UserStats):
    height_m = data.height / 100
    bmi = round(data.weight / (height_m * height_m), 2)

    # 1. 공통 데이터 양식 정의
    user_info = f"[사용자 데이터]\n- 키: {data.height}cm\n- 몸무게: {data.weight}kg\n- BMI: {bmi}\n"
    
    # 2. type에 따라 프롬프트를 다르게 조립합니다.
    if data.type == "food":
        prompt = user_info + """
        당신은 전문 영양사입니다. 위 신체 데이터를 가진 사용자에게 꼭 맞춘 '식단 관리 규칙'을 작성해 주세요.
        탄수화물, 단백질, 지방의 권장 비율과 아침/점심/저녁 식단 예시를 한국어로 친절하게 알려주세요.
        (주의: 다른 주제는 제외하고 오직 '식단'에만 집중해서 답변해 주세요.)
        """
    elif data.type == "fitness":
        prompt = user_info + """
        당신은 전문 헬스 트레이너입니다. 위 신체 데이터를 가진 사용자에게 꼭 맞춘 '운동 프로그램'을 추천해 주세요.
        유산소와 근력 운동의 비율, 일주일 운동 루틴 예시를 한국어로 친절하게 알려주세요.
        (주의: 다른 주제는 제외하고 오직 '운동'에만 집중해서 답변해 주세요.)
        """
    else:
        # 기존의 종합 분석 (메인 BMI 확인용)
        prompt = user_info + f"""
        당신은 전문 헬스 트레이너입니다. 위 데이터를 바탕으로 다음 질문에 답해 주세요:
        1. 계산된 BMI {bmi}는 의학적으로 어떤 단계(저체중/정상/비만 등)에 해당하나요?
        2. 이 수치가 성인 평균과 비교했을 때 건강상 주의할 점은 무엇인지 판단해 주세요.
        3. 이 사용자가 '정상 범위'의 건강한 신체를 갖기 위해 시작할 수 있게 권장하는 답변을 한국어로 작성해 주세요.
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)