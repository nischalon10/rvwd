"""
Configuration for feedback generation.
"""

# Feedback Generation Settings
DEFAULT_SAMPLES_PER_SCHEMA = 15
TEST_SAMPLES_PER_SCHEMA = 3

# Diversity Settings
SENTIMENT_WEIGHTS = {
    "positive": 0.4,    # 40% positive
    "negative": 0.3,    # 30% negative  
    "neutral": 0.3      # 30% neutral
}

LENGTH_WEIGHTS = {
    "short": 0.3,       # 30% short (30-60 seconds)
    "medium": 0.5,      # 50% medium (1-3 minutes)
    "long": 0.2         # 20% long (3-5 minutes)
}

STYLE_WEIGHTS = {
    "casual": 0.4,      # 40% casual
    "formal": 0.2,      # 20% formal
    "emotional": 0.2,   # 20% emotional
    "matter-of-fact": 0.2  # 20% matter-of-fact
}

# Business Type Specific Prompts
BUSINESS_PROMPTS = {
    "App": "mobile app or software application",
    "University": "university course or educational program", 
    "retail_store": "retail store or shopping experience",
    "healthcare": "healthcare service or medical facility",
    "hotel": "hotel or accommodation",
    "gym": "fitness center or gym",
    "salon": "beauty salon or spa",
    "car_dealership": "car dealership or automotive service",
    "online_service": "online service or digital platform"
}

# Rate Limiting
OPENAI_DELAY_SECONDS = 2
MAX_RETRIES = 3

# Output Settings
OUTPUT_DIR = "feedback_data"
SCHEMA_DIR = "."
