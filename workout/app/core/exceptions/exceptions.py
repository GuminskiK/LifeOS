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

class WorkoutNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Workout")

class ExerciseNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Exercise")

class ExerciseLogNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="ExerciseLog")

class WorkoutSessionNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="WorkoutSession")

class WorkoutStepNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="WorkoutStep")


class ExerciseNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="Exercise")

class ExerciseLogNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="ExerciseLog")

class WorkoutStepNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="WorkoutStep")

class WorkoutSessionNotFoundException(ResourceNotFoundException):
    def __init__(self):
        super().__init__(resource_name="WorkoutSession")
###########################
#class SessionNotFoundException(ResourceNotFoundException):
#    def __init__(self, resource_name: str = "Session"):
#        super().__init__(resource_name=resource_name)


##########################
#class AdminForibiddenFromCreatingApiKeyException(ForbiddenException):
#    def __init__(self, detail: str = "Not authorized to perform this action"):
#        super().__init__(detail="Admin is forbidden from creating api keys")



#########################


#class TwoFaAlreadyEnabledException(BadRequestException):
#    def __init__(self, detail: str = "Bad Request"):
#        super().__init__(detail="2FA is already enabled")


####
#class Invalid2FACodeException(UnauthorizedException):
#    def __init__(self, detail: str = "Unauthorized"):
#        super().__init__(detail="Invalid 2FA code")



#####
#class FailedToSentActivationEmailException(InternalServerErrorException):
#    def __init__(self, detail: str = "Internal server error"):
#        super().__init__(detail="Failed to sent activation email")

