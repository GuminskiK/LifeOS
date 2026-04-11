from .Users import User
from .Creators import Creator
from .Platforms import Platform
from .Posts import Post
from .ScraperSettings import ScraperConfig

User.model_rebuild()
Creator.model_rebuild()
Platform.model_rebuild()
Post.model_rebuild()
ScraperConfig.model_rebuild()