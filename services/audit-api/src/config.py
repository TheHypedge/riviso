"""
Configuration management for RIVISO Analytics API.
"""

import os
from typing import List, Optional
from pydantic import BaseModel, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "RIVISO Analytics API"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"
    log_level: str = "INFO"
    
    # Database
    database_url: str = "postgresql://riviso:password@localhost:5432/riviso"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    
    # Security
    secret_key: str = "your-secret-key-here-change-in-production"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://www.riviso.com",
        "https://riviso.com",
        "https://riviso-git-main-hypedges-projects.vercel.app",
        "https://riviso-izf1efhmn-hypedges-projects.vercel.app"
    ]
    allowed_hosts: List[str] = [
        "localhost", 
        "127.0.0.1",
        "www.riviso.com",
        "riviso.com",
        "riviso-production.up.railway.app",
        "riviso-git-main-hypedges-projects.vercel.app",
        "riviso-izf1efhmn-hypedges-projects.vercel.app"
    ]
    
    # External Services
    audit_api_url: str = "http://localhost:8000"
    web_app_url: str = "http://localhost:3000"
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600
    
    # Audit Configuration
    max_audit_urls: int = 5
    audit_timeout: int = 300
    max_redirects: int = 5
    max_content_size: int = 10485760  # 10MB
    user_agent: str = "RIVISO-Analytics-Bot/1.0"
    
    # Queue Configuration
    queue_poll_interval: int = 5
    queue_max_retries: int = 3
    queue_retry_delay: int = 60
    
    # Observability
    sentry_dsn: Optional[str] = None
    otel_service_name: str = "riviso-analytics-api"
    otel_exporter_otlp_endpoint: Optional[str] = None
    
    # Development
    reload: bool = False
    workers: int = 1
    
    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("allowed_hosts", pre=True)
    def parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    @validator("environment")
    def validate_environment(cls, v):
        return v.lower()
    
    @validator("log_level")
    def validate_log_level(cls, v):
        return v.upper()
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
