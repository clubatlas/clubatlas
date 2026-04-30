"""
ClubAtlas Backend 실행 스크립트
"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,  # 개발 모드: 코드 변경 시 자동 재시작
        log_level="info"
    )

