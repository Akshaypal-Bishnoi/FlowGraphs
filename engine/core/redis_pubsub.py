import redis
import json
import os
import logging

logger = logging.getLogger(__name__)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")

class RedisPublisher:
    def __init__(self):
        try:
            self.client = redis.from_url(REDIS_URL)
            logger.info("Connected to Redis for Pub/Sub")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None

    def publish_execution_update(self, execution_id: str, node_id: str, status: str, data: dict = None):
        if not self.client:
            return
            
        message = {
            "execution_id": execution_id,
            "node_id": node_id,
            "status": status, # PENDING, RUNNING, SUCCESS, FAILED
            "data": data or {}
        }
        
        try:
            self.client.publish(f"execution_stream:{execution_id}", json.dumps(message))
            # Also publish to a general firehose channel if needed
            self.client.publish("pipeline_updates", json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to publish to Redis: {e}")

publisher = RedisPublisher()
