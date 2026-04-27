from .Users import User, UserRead, UserCreate
from .Creators import Creator, CreatorRead, CreatorCreate
from .Platforms import Platform, PlatformRead, PlatformCreate
from .Posts import Post, PostRead, PostCreate
from .ScraperSettings import ScraperConfig, ScraperTriggerType
from .AggregatorExtensions import FavoritePost

# Rebuild table models to resolve Relationship forward refs
User.model_rebuild()
Creator.model_rebuild()
Platform.model_rebuild()
Post.model_rebuild()
ScraperConfig.model_rebuild()
FavoritePost.model_rebuild()

# Rebuild Read/Create schemas if they use any of the above models as types
UserRead.model_rebuild()
CreatorRead.model_rebuild()
PlatformRead.model_rebuild()
PostRead.model_rebuild()