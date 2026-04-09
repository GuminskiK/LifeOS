from fastapi import HTTPException, status
from jose import jwt, JWTError
from typing import Any


def decode_token(
    token: str, 
    secret_key: str, 
    algorithm: str, 
    app_name: str
    
) -> dict[str, Any]:
    
    """Decodes and validates a JWT token"""
    try:
        payload = jwt.decode(
            token, 
            secret_key, 
            algorithms=[algorithm], 
            audience=f"{app_name}-api", 
            issuer=app_name
        )
        return payload
    
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

