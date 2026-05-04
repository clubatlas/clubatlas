"""
Firebase Admin SDK initialization
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.config import settings


def initialize_firebase_admin():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        private_key = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")
        client_email = os.getenv("FIREBASE_CLIENT_EMAIL")

        storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET", "clubatlas-ecaa4.firebasestorage.app")

        if project_id and private_key and client_email:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": project_id,
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
                "private_key": private_key,
                "client_email": client_email,
                "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL", ""),
            })
            firebase_admin.initialize_app(cred, {"storageBucket": storage_bucket})
        else:
            options = {"projectId": project_id} if project_id else {}
            if storage_bucket:
                options["storageBucket"] = storage_bucket
            firebase_admin.initialize_app(options=options)

        return firebase_admin.get_app()

    return firebase_admin.get_app() if firebase_admin._apps else None


_firebase_initialized = False
_db = None
_auth_client = None


def get_firestore():
    """Return Firestore client"""
    global _firebase_initialized, _db
    if not _firebase_initialized:
        app = initialize_firebase_admin()
        _firebase_initialized = True
        if app is None:
            return None
    if _db is None and firebase_admin._apps:
        _db = firestore.client()
    return _db


def get_auth():
    """Return Firebase Auth client"""
    global _firebase_initialized, _auth_client
    if not _firebase_initialized:
        initialize_firebase_admin()
        _firebase_initialized = True
    if _auth_client is None:
        _auth_client = auth
    return _auth_client
