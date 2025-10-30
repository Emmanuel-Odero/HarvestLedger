from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://harvest_user:harvest_pass@localhost:5432/harvest_ledger"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "harvest_ledger"
    DB_USER: str = "harvest_user"
    DB_PASSWORD: str = "harvest_pass"
    
    # JWT
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    # Hedera Configuration
    HEDERA_NETWORK: str = "testnet"
    OPERATOR_ID: str = ""
    OPERATOR_KEY: str = ""
    HEDERA_RPC_URL: str = "https://testnet.hashio.io/api"
    
    # Hedera Resources
    HCS_TOPIC_ID: str = ""
    LOAN_CONTRACT_ID: str = ""
    
    # Mirror Node
    MIRROR_NODE_URL: str = "https://testnet.mirrornode.hedera.com/api/v1"
    
    # API URLs
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Email Configuration
    SMTP_HOST: str = "mailhog"
    SMTP_PORT: int = 1025
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = False
    MAIL_FROM: str = "noreply@harvest.com"

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def smtp_host(self) -> str:
        return self.SMTP_HOST
    
    @property
    def smtp_port(self) -> int:
        return self.SMTP_PORT
    
    @property
    def smtp_user(self) -> str:
        return self.SMTP_USER
    
    @property
    def smtp_password(self) -> str:
        return self.SMTP_PASSWORD
    
    @property
    def smtp_tls(self) -> bool:
        return self.SMTP_TLS
    
    @property
    def mail_from(self) -> str:
        return self.MAIL_FROM
    
    @property
    def frontend_url(self) -> str:
        return self.FRONTEND_URL

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()