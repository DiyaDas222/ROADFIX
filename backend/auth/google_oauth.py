import os

from flask import session, request

from google_auth_oauthlib.flow import Flow


# ============================================================
# LOCAL DEVELOPMENT ONLY
# ============================================================
# Allows OAuth to work on localhost over HTTP.
# Remove this before production deployment with HTTPS.
os.environ.setdefault(
    "OAUTHLIB_INSECURE_TRANSPORT",
    "1"
)


GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID"
)

GOOGLE_CLIENT_SECRET = os.getenv(
    "GOOGLE_CLIENT_SECRET"
)

GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://localhost:5000/api/auth/google/callback"
)


GOOGLE_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]


# ============================================================
# CREATE GOOGLE FLOW
# ============================================================

def create_google_flow(state=None):

    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [
                GOOGLE_REDIRECT_URI
            ],
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=GOOGLE_SCOPES,
        state=state
    )

    flow.redirect_uri = GOOGLE_REDIRECT_URI

    return flow


# ============================================================
# START GOOGLE LOGIN
# ============================================================

def get_google_authorization_url(role):

    flow = create_google_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="select_account",
        code_challenge_method="S256"
    )

    # Save OAuth state
    session["google_oauth_state"] = state

    # Save selected RoadFix role
    session["google_role"] = role

    # IMPORTANT:
    # Save PKCE verifier so callback can exchange the code.
    session["google_code_verifier"] = flow.code_verifier

    return authorization_url


# ============================================================
# EXCHANGE GOOGLE AUTHORIZATION CODE
# ============================================================

def exchange_google_code():

    state = session.get(
        "google_oauth_state"
    )

    code_verifier = session.get(
        "google_code_verifier"
    )

    if not state:
        raise ValueError(
            "Google OAuth session has expired"
        )

    if not code_verifier:
        raise ValueError(
            "Google OAuth code verifier is missing"
        )

    flow = create_google_flow(
        state=state
    )

    # Restore PKCE verifier
    flow.code_verifier = code_verifier

    flow.fetch_token(
        authorization_response=request.url,
        code_verifier=code_verifier
    )

    # Remove one-time OAuth values
    session.pop(
        "google_oauth_state",
        None
    )

    session.pop(
        "google_code_verifier",
        None
    )

    return flow.credentials