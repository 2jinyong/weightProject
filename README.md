# 🏋️ Weight Project

건강한 체중 관리를 위한 AI 기반 웹 프로젝트입니다.  
사용자의 BMI 및 신체 정보를 기반으로 맞춤형 운동 루틴과 피드백을 제공합니다.

---

## 📌 프로젝트 소개

- 사용자의 BMI 및 체형 데이터를 기반으로 건강 상태 분석
- 맞춤형 운동 루틴 및 피드백 제공
- Spring Framework 기반 백엔드 서버 구현
- FastAPI 기반 AI 분석 서버 구현
- 프론트엔드/백엔드 분리형 구조 설계
- REST API 기반 서버 간 통신 구현

---

## 🛠 개발 환경 및 기술 스택

### Backend
- Java (OpenJDK 11)
- Spring Framework 5.3.18
- Spring JDBC
- Apache Tomcat 9
- Maven

### Frontend
- HTML / CSS / JavaScript
- Node.js v24.15

### Database
- MySQL 8.0.28

### AI Server
- Python FastAPI
- Groq API
- Llama 3.1-8B-Instant

### Tools
- STS(Spring Tool Suite)
- VS Code
- Git & GitHub

### Architecture
- 프론트엔드/백엔드 분리형 구조
- REST API 기반 통신

---

## ✨ 주요 기능

### 👤 사용자 정보 관리
- 사용자 이름, 키, 체중, BMI 등록
- 사용자 정보 조회 및 삭제 기능

### 📊 BMI 분석
- 입력된 키와 체중을 기반으로 BMI 계산
- BMI 상태(저체중 / 정상 / 과체중 / 비만) 분석

BMI 공식:

```math
BMI = \frac{weight}{height^2}
```

### 🤖 AI 운동 루틴 추천
- 사용자 BMI 상태 기반 운동 루틴 생성
- 요일별 운동 부위 및 운동 방법 추천
- 부상 방지 팁 제공

---

## 🚀 AI 서버 및 배포 과정

초기 개발 환경에서는 Ollama 기반 Gemma 2:2B 로컬 모델을 사용하여 AI 기능을 구현하였습니다.

학교 실습 환경(GTX 3060 GPU)에서는 정상적으로 동작했지만,  
Microsoft Azure 무료 티어 Linux VM 환경에서는 서버 사양 한계로 인해 AI 추론 과정에서 반복적인 타임아웃 문제가 발생하였습니다.

이를 해결하기 위해 Groq API에서 제공하는 Llama 3.1-8B-Instant 모델 기반 추론 방식으로 변경하였습니다.

- Groq 무료 API 서비스를 활용하여 개인 프로젝트 수준에서 비용 없이 운영 가능
- 응답 속도 개선 및 서버 안정성 확보
- Azure Ubuntu 24.04 VM 환경에 배포 진행

---

## ☁️ 배포 환경

- Microsoft Azure Linux VM (Ubuntu 24.04)
- Apache Tomcat 9 기반 서버 운영
- Spring 프로젝트를 WAR 파일 형태로 패키징 후 Tomcat에 배포
- FastAPI 기반 AI 분석 서버 운영
- Node.js 기반 프론트엔드 서버 운영
- REST API 기반 서버 간 통신 구성

---

## 📂 프로젝트 구조

```text
Frontend(Node.js)
        ↓ REST API
Spring Backend(Server)
        ↓
MySQL Database

Spring Backend
        ↓ REST API
FastAPI AI Server
        ↓
Groq Llama 3.1 API
```

---

## 📸 주요 기능 화면

- BMI 계산 페이지
- 사용자 정보 관리 페이지
- AI 운동 루틴 추천 페이지

---

## 🎯 프로젝트를 통해 배운 점

- Spring 기반 웹 애플리케이션 개발 경험
- FastAPI 기반 AI 서버 구축 경험
- REST API 서버 간 통신 구조 이해
- Azure Linux VM 배포 경험
- WAR 파일 기반 Tomcat 배포 경험
- AI 모델 추론 성능 문제 해결 경험
- 무료 클라우드 환경에서의 서버 운영 경험
- 프론트엔드/백엔드 분리 구조 설계 경험
