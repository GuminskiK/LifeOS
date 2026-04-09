from fastapi import HTTPException, status


class AppBaseException(HTTPException):
    """Base class for all app exceptions."""

    pass


class ResourceNotFoundException(AppBaseException):
    def __init__(self, resource_name: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found"
        )


class ForbiddenException(AppBaseException):
    def __init__(self, detail: str = "Not authorized to perform this action"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class BadRequestException(AppBaseException):
    def __init__(self, detail: str = "Bad Request"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST, detail=detail
        )


class UnauthorizedException(AppBaseException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=detail
        )


class InternalServerErrorException(AppBaseException):
    def __init__(self, detail: str = "Internal server error"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail
        )


class AdminNeededException(ForbiddenException):
    def __init__(self, detail: str = "Not authorized to perform this action"):
        super().__init__(detail="Only admin can perform this action")


class AdminOrOwnerNeededException(ForbiddenException):
    def __init__(self, detail: str = "Not authorized to perform this action"):
        super().__init__(detail="Only admin or owner can perform this action")
