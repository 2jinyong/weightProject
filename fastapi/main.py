from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import requests  
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 에러 방지 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BMIRequest(BaseModel):
    name: Optional[str] = "회원"
    height: float
    weight: float
    type: str  # 'bmi', 'food', 'fitness'

@app.post("/api/ai-feedback")
def get_ai_feedback(data: BMIRequest):
    try:
        if data.height <= 0:
            raise HTTPException(status_code=400, detail="올바르지 않은 신장 데이터입니다.")
            
        # 1. BMI 내부 계산 및 상태 판정
        height_m = data.height / 100
        bmi = round(data.weight / (height_m ** 2), 1)

        # 2. AI가 BMI를 보고 스스로 목표 결정
        if bmi < 18.5:
            bmi_status = "저체중"
            ai_goal = "건강한 체중 증량 및 골격근량 증가"
        elif bmi < 23:
            bmi_status = "정상"
            ai_goal = "현재 체중 유지 및 신체 밸런스, 기초 체력 향상"
        elif bmi < 25:
            bmi_status = "과체중"
            ai_goal = "점진적인 체지방 감량 및 대사량 증진"
        else:
            bmi_status = "비만"
            ai_goal = "관절에 무리가 가지 않는 체중 감량 및 심혈관 건강 회복"

        base_info = (
            f"회원 이름: {data.name}\n"
            f"신체 조건: 키 {data.height}cm, 몸무게 {data.weight}kg, BMI {bmi} ({bmi_status} 상태)\n"
            f"AI 자동 설정 목표: {ai_goal}\n\n"
        )

        # 3. type에 따른 페이지별 프롬프트 분기 (정상 상태일 때 타 상태 언급 차단 규칙 포함)
        if data.type == "bmi":
            prompt = (
                f"당신은 건강 분석가입니다. 다음 회원의 BMI 수치를 분석해 주세요.\n"
                f"{base_info}"
                f"--- [필수 작성 내용 및 엄격한 규칙] ---\n"
                f"1. 회원의 현재 판정 상태는 확실하게 '{bmi_status}'입니다. 절대 '{bmi_status}'가 아닌 다른 상태(예: 현재 정상인데 저체중이나 비만 등)의 특징이나 위험성을 본문에 언급하지 마세요. 오직 현재 상태인 '{bmi_status}'에만 100% 집중해서 답변해야 합니다.\n"
                f"2. 현재 상태({bmi_status})를 기준으로, 평소에 유지하면 좋은 올바른 습관이나 건강 관리 팁을 짧고 간결하게 짚어주세요.\n"
                f"3. AI가 설정한 목표({ai_goal})가 왜 이 회원에게 필요한지 가볍게 설명하세요.\n\n"
                f"--- [중요 행동 규칙: 스포일러 금지!] ---\n"
                f"- 절대, 무슨 일이 있어도 구체적인 '식단표'나 '운동 루틴'을 작성하지 마세요.\n"
                f"- 답변의 마지막에는 반드시 '자세한 맞춤형 식단과 운동 루틴은 아래의 [식단 페이지]와 [운동 페이지] 버튼을 눌러 확인해 보세요!'라는 뉘앙스로 마무리하여 사용자의 클릭을 유도하세요. 한국어로 답변하세요."
            )

        elif data.type == "food":
            prompt = (
                f"당신은 공인 임상영양사입니다. 다음 회원을 위한 맞춤형 식단 가이드를 작성하세요.\n"
                f"{base_info}"
                f"--- [필수 작성 내용] ---\n"
                f"1. AI가 설정한 목표({ai_goal})를 달성하기 위한 영양학적 접근법 및 일일 권장 칼로리\n"
                f"2. 월요일부터 일요일까지 일주일간 아침, 점심, 저녁, 간식의 탄단지(g)와 칼로리를 포함한 구체적인 식단표\n"
                f"3. 절대 피해야 할 음식 리스트\n\n"
                f"--- [중요 행동 규칙] ---\n"
                f"- 운동(가슴, 등, 세트 수 등)에 대한 언급은 절대 하지 마세요.\n"
                f"- 만약 {bmi_status}가 '저체중'이라면 절대로 다이어트 식단을 주지 말고 든든한 증량 식단을 제공하세요.\n"
                f"- 만약 {bmi_status}가 '비만'이라면 혈당을 관리하고 지방을 태우는 식단으로 구성하세요."
            )
            
        elif data.type == "fitness":
            prompt = (
                f"당신은 전문 헤드 트레이너입니다. 다음 회원을 위한 맞춤형 운동 프로그램을 작성하세요.\n"
                f"{base_info}"
                f"--- [필수 작성 내용] ---\n"
                f"1. AI가 설정한 목표({ai_goal})를 달성하기 위한 주간 운동 방향성\n"
                f"2. 월~일요일까지 요일별 타겟 부위, 종목명, 세트 수, 횟수, 휴식 시간을 포함한 구체적인 루틴\n"
                f"3. 현재 상태({bmi_status})에서 조심해야 할 부상 방지 팁\n\n"
                f"--- [중요 행동 규칙] ---\n"
                f"- 식단(아침, 점심 메뉴 등)에 대한 언급은 절대 하지 마세요.\n"
                f"- 만약 {bmi_status}가 '비만'이나 '과체중'이라면 무리한 고중량 운동을 배제하고, 관절을 보호하는 유산소와 맨몸 운동 위주로 구성하세요."
            )
            
        else:
            raise HTTPException(status_code=400, detail="올바르지 않은 type 값입니다. ('bmi', 'food', 'fitness' 중 하나여야 합니다.)")

        # 4. Groq API 호출 (전달해주신 신규 키 적용 및 헛소리 방지 온도 하향)
        api_key = "yourkey" 
        url = "https://api.groq.com/openai/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.1-8b-instant",  
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2  
        }

        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Groq API 오류: {response.text}")
            
        result_json = response.json()
        ai_response = result_json["choices"][0]["message"]["content"]

        return {
            "status": "success",
            "bmi": bmi,
            "status_text": bmi_status,
            "ai_goal": ai_goal,
            "feedback": ai_response  
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"서버 에러 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8181, reload=True)
