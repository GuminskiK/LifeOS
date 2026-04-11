from .creators import Creator
from .platforms import Platform
from .posts import Post

Creator.model_rebuild()
Platform.model_rebuild()
Post.model_rebuild()