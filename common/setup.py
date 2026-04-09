from setuptools import setup, find_packages

setup(
    name="common_lib",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "python-jose[cryptography]",
        "pydantic",
        "sqlmodel",
        "redis",
        "structlog",
        "slowapi"
    ],
    description="Common library for LifeOS microservices",
)