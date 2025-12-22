import redis.asyncio as redis
from typing import Optional
from app.core.config import settings

class RedisClient:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
    
    async def set_nonce(self, nonce: str, address: str, expire_seconds: int = 300):
        """Store nonce with expiration (5 minutes default)"""
        if self.redis:
            try:
                await self.redis.setex(f"nonce:{nonce}", expire_seconds, address)
                print(f"✅ Nonce stored in Redis: {nonce[:10]}... for {address[:20]}...")
            except Exception as e:
                print(f"❌ Redis setex failed: {e}")
                raise
    
    async def get_nonce(self, nonce: str) -> Optional[str]:
        """Get and delete nonce (one-time use)"""
        if self.redis:
            try:
                address = await self.redis.get(f"nonce:{nonce}")
                print(f"🔍 Redis get nonce: {nonce[:10]}... -> {address[:20] if address else 'None'}...")
                if address:
                    await self.redis.delete(f"nonce:{nonce}")
                    print(f"✅ Nonce deleted from Redis")
                return address
            except Exception as e:
                print(f"❌ Redis get failed: {e}")
                return None
        print(f"⚠️  Redis client not connected")
        return None
    
    async def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if self.redis:
            try:
                await self.redis.ping()
                return True
            except:
                return False
        return False

# Global Redis client instance
redis_client = RedisClient()