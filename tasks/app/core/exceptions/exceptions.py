from fastapi import HTTPException, status


class AppBaseException(HTTPException):
    """Base class for all app exceptions."""

    pass


class ResourceNotFoundException(AppBaseException):
    def __init__(self, resource_name: str = "Resource"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource_name} not found"
        )


class ForbiddenException(AppBaseException):
    def __init__(self, detail: str = "Not authorized to perform this action"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class BadRequestException(AppBaseException):
    def __init__(self, detail: str = "Bad Request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedException(AppBaseException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class InternalServerErrorException(AppBaseException):
    def __init__(self, detail: str = "Internal server error"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail
        )


###########################
class CategoryNotFoundException(ResourceNotFoundException):
    def __init__(self, resource_name: str = "Category"):
        super().__init__(resource_name=resource_name)

class VaultNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Vault")

class ExperienceTransactionNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="ExperienceTransaction")

class RewardTransactionNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="RewardTransaction")

class GoalsNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Goals")

class RewardNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Reward")

class StreakNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Streak")

class TaskNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Task")

##########################
#class AdminForibiddenFromCreatingApiKeyException(ForbiddenException):
#    def __init__(self, detail: str = "Not authorized to perform this action"):
#        super().__init__(detail="Admin is forbidden from creating api keys")



#########################


class NotEnoughCurrencyException(BadRequestException):
    def __init__(self, detail: str = "Bad Request"):
        super().__init__(detail="Not enough currency in vault")


####
#class Invalid2FACodeException(UnauthorizedException):
#    def __init__(self, detail: str = "Unauthorized"):
#        super().__init__(detail="Invalid 2FA code")



#####
#class FailedToSentActivationEmailException(InternalServerErrorException):
#    def __init__(self, detail: str = "Internal server error"):
#        super().__init__(detail="Failed to sent activation email")

