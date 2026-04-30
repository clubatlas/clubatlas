"""
ClubAtlas Backend - 설정 관리
"""
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()


class Settings:
    """애플리케이션 설정"""
    
    # CORS 설정
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    
    # 서버 설정
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # API 정보
    API_TITLE: str = "ClubAtlas API"
    API_DESCRIPTION: str = "A web-based centralized club platform API"
    API_VERSION: str = "1.0.0"
    
    # 데이터베이스 설정 (향후 추가)
    # DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # LLM API 설정 (향후 추가)
    # OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    # ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Firebase 설정
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")


# 전역 설정 인스턴스
settings = Settings()


