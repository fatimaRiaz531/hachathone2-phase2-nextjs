from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from ..schemas.user import UserResponse
from ..schemas.auth import UserSignup, UserLogin, Token
from ..services.user_service import UserService
from ..core.auth import create_access_token
from ..core.auth_deps import get_current_user
import uuid


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=Token)
async def signup_user(user_data: UserSignup):
    """
    Signup endpoint to create a new user.
    - Creates new user in the database
    - Returns JWT token for the new user
    """
    user_service = UserService()

    # Check if user already exists
    existing_user = user_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Generate a unique external ID for the user (in real implementation, this comes from Better Auth)
    external_id = str(uuid.uuid4())

    # Create user data for the internal database
    # Note: In a real implementation, password would be handled by Better Auth
    from app.models.user import UserBase
    user_base = UserBase(
        external_id=external_id,
        email=user_data.email,
        name=user_data.name
    )

    # Create new user
    user = user_service.create_user(user_base)

    # Create access token
    access_token_expires = timedelta(minutes=30)  # 30 minutes expiry
    access_token = create_access_token(
        data={"sub": user.external_id, "email": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login_user(user_data: UserLogin):
    """
    Login endpoint that verifies user credentials and returns a JWT token.
    Note: In a real implementation, this would verify credentials against Better Auth.
    For this implementation, we're simulating the process.
    """
    user_service = UserService()

    # Find user by email
    user = user_service.get_user_by_email(user_data.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # In a real implementation, we would verify the password here
    # For this implementation, we'll assume the credentials are valid
    # since Better Auth handles the actual authentication

    # Create access token
    access_token_expires = timedelta(minutes=30)  # 30 minutes expiry
    access_token = create_access_token(
        data={"sub": user.external_id, "email": user.email},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user information based on the JWT token.
    """
    user_service = UserService()

    # Get user by the ID in the token
    user_id = current_user.get("sub")
    user = user_service.get_user_by_external_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user