"""
더미 데이터 생성 스크립트
- 테스트용 동아리 데이터
- 테스트용 사용자 및 선호도
- 테스트용 사용자 활동 기록
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import asyncio
from datetime import datetime
from app.services.firestore_service import club_service, FirestoreService

firestore_service = FirestoreService()


# 더미 동아리 데이터
DUMMY_CLUBS = [
    {
        "id": "club_tech_robotics",
        "name": "Robotics Club",
        "description": "로봇 제작과 프로그래밍을 통해 기술을 배우고 대회에 참가합니다.",
        "tagline": "미래를 만드는 로봇공학",
        "categories": ["Technology", "Engineering", "STEM"],
        "tags": ["robotics", "programming", "competition", "arduino"],
        "activity_type": ["On-Campus"],
        "meeting_schedule": [
            {
                "day": "Tuesday",
                "time_slots": ["16:00-18:00"],
                "location": "Engineering Lab 301"
            },
            {
                "day": "Thursday",
                "time_slots": ["16:00-18:00"],
                "location": "Engineering Lab 301"
            }
        ],
        "leaders": [
            {
                "uid": "leader_robotics",
                "name": "김로봇",
                "role": "President",
                "email": "robotics@university.edu"
            }
        ],
        "contact_email": "robotics@university.edu"
    },
    {
        "id": "club_arts_photography",
        "name": "Photography Club",
        "description": "사진 촬영 기술을 배우고 전시회를 개최하며 예술적 감각을 키웁니다.",
        "tagline": "순간을 포착하는 예술",
        "categories": ["Arts", "Creative", "Visual Arts"],
        "tags": ["photography", "exhibition", "camera", "art"],
        "activity_type": ["Hybrid", "Off-Campus"],
        "meeting_schedule": [
            {
                "day": "Wednesday",
                "time_slots": ["14:00-16:00"],
                "location": "Art Building 205"
            }
        ],
        "leaders": [
            {
                "uid": "leader_photo",
                "name": "이사진",
                "role": "President",
                "email": "photo@university.edu"
            }
        ],
        "contact_email": "photo@university.edu"
    },
    {
        "id": "club_science_astronomy",
        "name": "Astronomy Club",
        "description": "천체 관측과 우주 과학을 공부하며 밤하늘의 신비를 탐험합니다.",
        "tagline": "별을 관찰하는 과학자들",
        "categories": ["Science", "STEM", "Nature"],
        "tags": ["astronomy", "telescope", "space", "observation"],
        "activity_type": ["Off-Campus"],
        "meeting_schedule": [
            {
                "day": "Friday",
                "time_slots": ["18:00-22:00"],
                "location": "University Observatory"
            }
        ],
        "leaders": [
            {
                "uid": "leader_astro",
                "name": "박별",
                "role": "President",
                "email": "astro@university.edu"
            }
        ],
        "contact_email": "astro@university.edu"
    },
    {
        "id": "club_tech_ai",
        "name": "AI & Machine Learning Club",
        "description": "인공지능과 머신러닝을 학습하고 프로젝트를 진행합니다.",
        "tagline": "AI로 미래를 설계하다",
        "categories": ["Technology", "Computer Science", "STEM"],
        "tags": ["ai", "machine-learning", "python", "deep-learning"],
        "activity_type": ["Online"],
        "meeting_schedule": [
            {
                "day": "Monday",
                "time_slots": ["19:00-21:00"],
                "location": "Zoom"
            },
            {
                "day": "Wednesday",
                "time_slots": ["19:00-21:00"],
                "location": "Zoom"
            }
        ],
        "leaders": [
            {
                "uid": "leader_ai",
                "name": "최인공",
                "role": "President",
                "email": "ai@university.edu"
            }
        ],
        "contact_email": "ai@university.edu"
    },
    {
        "id": "club_sports_soccer",
        "name": "Soccer Club",
        "description": "축구를 통해 건강과 팀워크를 키우며 리그전에 참가합니다.",
        "tagline": "열정과 협동의 그라운드",
        "categories": ["Sports", "Recreation", "Team Sports"],
        "tags": ["soccer", "football", "sports", "teamwork"],
        "activity_type": ["On-Campus"],
        "meeting_schedule": [
            {
                "day": "Tuesday",
                "time_slots": ["17:00-19:00"],
                "location": "University Field"
            },
            {
                "day": "Thursday",
                "time_slots": ["17:00-19:00"],
                "location": "University Field"
            }
        ],
        "leaders": [
            {
                "uid": "leader_soccer",
                "name": "정축구",
                "role": "Captain",
                "email": "soccer@university.edu"
            }
        ],
        "contact_email": "soccer@university.edu"
    },
    {
        "id": "club_music_band",
        "name": "University Band",
        "description": "다양한 악기를 연주하며 공연을 준비하고 음악적 재능을 발전시킵니다.",
        "tagline": "하모니를 만드는 음악가들",
        "categories": ["Arts", "Music", "Performance"],
        "tags": ["music", "band", "performance", "instruments"],
        "activity_type": ["On-Campus"],
        "meeting_schedule": [
            {
                "day": "Wednesday",
                "time_slots": ["16:00-18:00"],
                "location": "Music Hall"
            },
            {
                "day": "Friday",
                "time_slots": ["16:00-18:00"],
                "location": "Music Hall"
            }
        ],
        "leaders": [
            {
                "uid": "leader_band",
                "name": "강음악",
                "role": "Director",
                "email": "band@university.edu"
            }
        ],
        "contact_email": "band@university.edu"
    },
    {
        "id": "club_business_entrepreneurship",
        "name": "Entrepreneurship Club",
        "description": "창업 아이디어를 개발하고 비즈니스 스킬을 배우며 스타트업 문화를 경험합니다.",
        "tagline": "미래의 기업가를 위한 공간",
        "categories": ["Business", "Innovation", "Leadership"],
        "tags": ["startup", "entrepreneurship", "business", "innovation"],
        "activity_type": ["Hybrid", "Online"],
        "meeting_schedule": [
            {
                "day": "Thursday",
                "time_slots": ["18:00-20:00"],
                "location": "Business Center / Zoom"
            }
        ],
        "leaders": [
            {
                "uid": "leader_entrepreneur",
                "name": "윤창업",
                "role": "President",
                "email": "entrepreneur@university.edu"
            }
        ],
        "contact_email": "entrepreneur@university.edu"
    },
    {
        "id": "club_science_chemistry",
        "name": "Chemistry Research Club",
        "description": "화학 실험과 연구를 통해 과학적 사고력을 키우고 학술대회에 참가합니다.",
        "tagline": "실험실에서 발견하는 과학",
        "categories": ["Science", "Research", "STEM"],
        "tags": ["chemistry", "research", "lab", "experiment"],
        "activity_type": ["On-Campus"],
        "meeting_schedule": [
            {
                "day": "Monday",
                "time_slots": ["15:00-17:00"],
                "location": "Chemistry Lab 102"
            }
        ],
        "leaders": [
            {
                "uid": "leader_chem",
                "name": "한화학",
                "role": "President",
                "email": "chemistry@university.edu"
            }
        ],
        "contact_email": "chemistry@university.edu"
    },
    {
        "id": "club_culture_debate",
        "name": "Debate Club",
        "description": "토론 능력과 논리적 사고를 개발하며 전국 토론대회에 참가합니다.",
        "tagline": "논리로 승부하는 토론의 장",
        "categories": ["Academic", "Communication", "Leadership"],
        "tags": ["debate", "public-speaking", "argumentation", "competition"],
        "activity_type": ["On-Campus"],
        "meeting_schedule": [
            {
                "day": "Wednesday",
                "time_slots": ["17:00-19:00"],
                "location": "Student Center 401"
            }
        ],
        "leaders": [
            {
                "uid": "leader_debate",
                "name": "서토론",
                "role": "President",
                "email": "debate@university.edu"
            }
        ],
        "contact_email": "debate@university.edu"
    },
    {
        "id": "club_tech_web",
        "name": "Web Development Club",
        "description": "웹 개발 기술을 배우고 실제 프로젝트를 진행하며 포트폴리오를 구축합니다.",
        "tagline": "웹으로 세상을 연결하다",
        "categories": ["Technology", "Computer Science", "Design"],
        "tags": ["web-dev", "html", "css", "javascript", "react"],
        "activity_type": ["Online", "Hybrid"],
        "meeting_schedule": [
            {
                "day": "Tuesday",
                "time_slots": ["19:00-21:00"],
                "location": "Discord / Zoom"
            }
        ],
        "leaders": [
            {
                "uid": "leader_webdev",
                "name": "임웹",
                "role": "President",
                "email": "webdev@university.edu"
            }
        ],
        "contact_email": "webdev@university.edu"
    }
]


# 더미 사용자 데이터
DUMMY_USERS = [
    {
        "uid": "test_user_tech_lover",
        "email": "techstudent@test.com",
        "display_name": "테크 러버",
        "role": "student",
        "interests": ["coding", "robotics", "ai"],
        "recommendation_preferences": {
            "preferred_categories": ["Technology", "Computer Science", "STEM"],
            "preferred_activity_types": ["On-Campus", "Online"],
            "available_time_slots": ["16:00", "17:00", "18:00", "19:00"],
            "last_updated": datetime.now(),
            "source": "ai-form"
        }
    },
    {
        "uid": "test_user_arts_enthusiast",
        "email": "artstudent@test.com",
        "display_name": "예술가 지망생",
        "role": "student",
        "interests": ["photography", "music", "design"],
        "recommendation_preferences": {
            "preferred_categories": ["Arts", "Creative", "Music"],
            "preferred_activity_types": ["On-Campus", "Hybrid"],
            "available_time_slots": ["14:00", "15:00", "16:00"],
            "last_updated": datetime.now(),
            "source": "ai-form"
        }
    },
    {
        "uid": "test_user_science_geek",
        "email": "sciencestudent@test.com",
        "display_name": "과학 덕후",
        "role": "student",
        "interests": ["astronomy", "chemistry", "research"],
        "recommendation_preferences": {
            "preferred_categories": ["Science", "Research", "STEM"],
            "preferred_activity_types": ["On-Campus", "Off-Campus"],
            "available_time_slots": ["15:00", "16:00", "17:00", "18:00"],
            "last_updated": datetime.now(),
            "source": "ai-form"
        }
    }
]


# 더미 사용자 활동 데이터
DUMMY_ACTIVITIES = [
    # test_user_tech_lover의 활동
    {
        "user_id": "test_user_tech_lover",
        "activity_type": "view_club",
        "club_id": "club_tech_robotics",
        "metadata": {"duration": 120}
    },
    {
        "user_id": "test_user_tech_lover",
        "activity_type": "view_club",
        "club_id": "club_tech_ai",
        "metadata": {"duration": 180}
    },
    {
        "user_id": "test_user_tech_lover",
        "activity_type": "subscribe_club",
        "club_id": "club_tech_ai",
        "metadata": {}
    },
    {
        "user_id": "test_user_tech_lover",
        "activity_type": "click_detail",
        "club_id": "club_tech_web",
        "metadata": {}
    },
    # test_user_arts_enthusiast의 활동
    {
        "user_id": "test_user_arts_enthusiast",
        "activity_type": "view_club",
        "club_id": "club_arts_photography",
        "metadata": {"duration": 150}
    },
    {
        "user_id": "test_user_arts_enthusiast",
        "activity_type": "subscribe_club",
        "club_id": "club_arts_photography",
        "metadata": {}
    },
    {
        "user_id": "test_user_arts_enthusiast",
        "activity_type": "view_club",
        "club_id": "club_music_band",
        "metadata": {"duration": 90}
    },
    # test_user_science_geek의 활동
    {
        "user_id": "test_user_science_geek",
        "activity_type": "view_club",
        "club_id": "club_science_astronomy",
        "metadata": {"duration": 200}
    },
    {
        "user_id": "test_user_science_geek",
        "activity_type": "subscribe_club",
        "club_id": "club_science_astronomy",
        "metadata": {}
    },
    {
        "user_id": "test_user_science_geek",
        "activity_type": "view_club",
        "club_id": "club_science_chemistry",
        "metadata": {"duration": 160}
    },
    {
        "user_id": "test_user_science_geek",
        "activity_type": "click_detail",
        "club_id": "club_tech_robotics",
        "metadata": {}
    }
]


async def create_clubs():
    """동아리 데이터 생성"""
    print("\n🏫 동아리 데이터 생성 중...")
    created_count = 0
    
    for club_data in DUMMY_CLUBS:
        try:
            club_id = club_data.pop('id')
            await club_service.create_club(
                club_id=club_id,
                name=club_data['name'],
                description=club_data['description'],
                categories=club_data['categories'],
                activity_type=club_data['activity_type'],
                tagline=club_data.get('tagline'),
                tags=club_data.get('tags', []),
                meeting_schedule=club_data.get('meeting_schedule'),
                leaders=club_data.get('leaders', []),
                contact_email=club_data.get('contact_email')
            )
            created_count += 1
            print(f"  ✅ {club_data['name']} 생성 완료")
        except Exception as e:
            print(f"  ❌ {club_data['name']} 생성 실패: {str(e)}")
    
    print(f"\n✅ 총 {created_count}개 동아리 생성 완료!")


async def create_users():
    """사용자 데이터 생성"""
    print("\n👤 사용자 데이터 생성 중...")
    created_count = 0
    
    for user_data in DUMMY_USERS:
        try:
            await firestore_service.create_document(
                'users',
                user_data['uid'],
                user_data
            )
            created_count += 1
            print(f"  ✅ {user_data['display_name']} ({user_data['uid']}) 생성 완료")
        except Exception as e:
            print(f"  ❌ {user_data['display_name']} 생성 실패: {str(e)}")
    
    print(f"\n✅ 총 {created_count}명 사용자 생성 완료!")


async def create_activities():
    """사용자 활동 데이터 생성"""
    print("\n📊 사용자 활동 데이터 생성 중...")
    created_count = 0
    
    for activity_data in DUMMY_ACTIVITIES:
        try:
            activity_id = f"{activity_data['user_id']}_{activity_data['club_id']}_{created_count}"
            await firestore_service.create_document(
                'user_activities',
                activity_id,
                activity_data
            )
            created_count += 1
            print(f"  ✅ 활동 기록 생성: {activity_data['user_id']} -> {activity_data['activity_type']}")
        except Exception as e:
            print(f"  ❌ 활동 기록 생성 실패: {str(e)}")
    
    print(f"\n✅ 총 {created_count}개 활동 기록 생성 완료!")


async def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("🎯 ClubAtlas 더미 데이터 생성 스크립트")
    print("=" * 60)
    
    try:
        # 1. 동아리 데이터 생성
        await create_clubs()
        
        # 2. 사용자 데이터 생성
        await create_users()
        
        # 3. 사용자 활동 데이터 생성
        await create_activities()
        
        print("\n" + "=" * 60)
        print("✅ 모든 더미 데이터 생성 완료!")
        print("=" * 60)
        print("\n📝 생성된 데이터:")
        print(f"  - 동아리: {len(DUMMY_CLUBS)}개")
        print(f"  - 사용자: {len(DUMMY_USERS)}명")
        print(f"  - 활동 기록: {len(DUMMY_ACTIVITIES)}개")
        print("\n🔍 테스트 계정:")
        for user in DUMMY_USERS:
            print(f"  - {user['display_name']}: {user['uid']}")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())


