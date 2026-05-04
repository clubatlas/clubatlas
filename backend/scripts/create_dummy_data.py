"""
Dummy data creation script
- Test club data
- Test users and preferences
- Test user activity records
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import asyncio
from datetime import datetime
from app.services.firestore_service import club_service, FirestoreService

firestore_service = FirestoreService()


DUMMY_CLUBS = [
    {
        "id": "club_tech_robotics",
        "name": "Robotics Club",
        "description": "Learn technology and participate in competitions through robot building and programming.",
        "tagline": "Robotics Engineering the Future",
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
                "name": "Kim Robot",
                "role": "President",
                "email": "robotics@university.edu"
            }
        ],
        "contact_email": "robotics@university.edu"
    },
    {
        "id": "club_arts_photography",
        "name": "Photography Club",
        "description": "Learn photography skills, hold exhibitions, and develop artistic sensibility.",
        "tagline": "The Art of Capturing Moments",
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
                "name": "Lee Photo",
                "role": "President",
                "email": "photo@university.edu"
            }
        ],
        "contact_email": "photo@university.edu"
    },
    {
        "id": "club_science_astronomy",
        "name": "Astronomy Club",
        "description": "Explore the mysteries of the night sky by studying celestial observation and space science.",
        "tagline": "Scientists Observing the Stars",
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
                "name": "Park Star",
                "role": "President",
                "email": "astro@university.edu"
            }
        ],
        "contact_email": "astro@university.edu"
    },
    {
        "id": "club_tech_ai",
        "name": "AI & Machine Learning Club",
        "description": "Study artificial intelligence and machine learning and work on projects.",
        "tagline": "Designing the Future with AI",
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
                "name": "Choi AI",
                "role": "President",
                "email": "ai@university.edu"
            }
        ],
        "contact_email": "ai@university.edu"
    },
    {
        "id": "club_sports_soccer",
        "name": "Soccer Club",
        "description": "Build health and teamwork through soccer and participate in league matches.",
        "tagline": "A Field of Passion and Collaboration",
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
                "name": "Jung Soccer",
                "role": "Captain",
                "email": "soccer@university.edu"
            }
        ],
        "contact_email": "soccer@university.edu"
    },
    {
        "id": "club_music_band",
        "name": "University Band",
        "description": "Play various instruments, prepare for performances, and develop musical talent.",
        "tagline": "Musicians Creating Harmony",
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
                "name": "Kang Music",
                "role": "Director",
                "email": "band@university.edu"
            }
        ],
        "contact_email": "band@university.edu"
    },
    {
        "id": "club_business_entrepreneurship",
        "name": "Entrepreneurship Club",
        "description": "Develop startup ideas, learn business skills, and experience startup culture.",
        "tagline": "A Space for Future Entrepreneurs",
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
                "name": "Yun Startup",
                "role": "President",
                "email": "entrepreneur@university.edu"
            }
        ],
        "contact_email": "entrepreneur@university.edu"
    },
    {
        "id": "club_science_chemistry",
        "name": "Chemistry Research Club",
        "description": "Develop scientific thinking through chemistry experiments and research, and participate in academic conferences.",
        "tagline": "Science Discovered in the Lab",
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
                "name": "Han Chemistry",
                "role": "President",
                "email": "chemistry@university.edu"
            }
        ],
        "contact_email": "chemistry@university.edu"
    },
    {
        "id": "club_culture_debate",
        "name": "Debate Club",
        "description": "Develop debating skills and logical thinking, and participate in national debate competitions.",
        "tagline": "The Arena of Logical Debate",
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
                "name": "Seo Debate",
                "role": "President",
                "email": "debate@university.edu"
            }
        ],
        "contact_email": "debate@university.edu"
    },
    {
        "id": "club_tech_web",
        "name": "Web Development Club",
        "description": "Learn web development skills, work on real projects, and build a portfolio.",
        "tagline": "Connecting the World Through the Web",
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
                "name": "Im Web",
                "role": "President",
                "email": "webdev@university.edu"
            }
        ],
        "contact_email": "webdev@university.edu"
    }
]


DUMMY_USERS = [
    {
        "uid": "test_user_tech_lover",
        "email": "techstudent@test.com",
        "display_name": "Tech Lover",
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
        "display_name": "Aspiring Artist",
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
        "display_name": "Science Geek",
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


DUMMY_ACTIVITIES = [
    # test_user_tech_lover activities
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
    # test_user_arts_enthusiast activities
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
    # test_user_science_geek activities
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
    """Create club data"""
    print("\n🏫 Creating club data...")
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
            print(f"  ✅ {club_data['name']} created")
        except Exception as e:
            print(f"  ❌ {club_data['name']} creation failed: {str(e)}")

    print(f"\n✅ Total {created_count} clubs created!")


async def create_users():
    """Create user data"""
    print("\n👤 Creating user data...")
    created_count = 0

    for user_data in DUMMY_USERS:
        try:
            await firestore_service.create_document(
                'users',
                user_data['uid'],
                user_data
            )
            created_count += 1
            print(f"  ✅ {user_data['display_name']} ({user_data['uid']}) created")
        except Exception as e:
            print(f"  ❌ {user_data['display_name']} creation failed: {str(e)}")

    print(f"\n✅ Total {created_count} users created!")


async def create_activities():
    """Create user activity data"""
    print("\n📊 Creating user activity data...")
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
            print(f"  ✅ Activity record created: {activity_data['user_id']} -> {activity_data['activity_type']}")
        except Exception as e:
            print(f"  ❌ Activity record creation failed: {str(e)}")

    print(f"\n✅ Total {created_count} activity records created!")


async def main():
    """Main execution function"""
    print("=" * 60)
    print("🎯 ClubAtlas Dummy Data Creation Script")
    print("=" * 60)

    try:
        await create_clubs()
        await create_users()
        await create_activities()

        print("\n" + "=" * 60)
        print("✅ All dummy data creation complete!")
        print("=" * 60)
        print("\n📝 Created data:")
        print(f"  - Clubs: {len(DUMMY_CLUBS)}")
        print(f"  - Users: {len(DUMMY_USERS)}")
        print(f"  - Activity records: {len(DUMMY_ACTIVITIES)}")
        print("\n🔍 Test accounts:")
        for user in DUMMY_USERS:
            print(f"  - {user['display_name']}: {user['uid']}")

    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
