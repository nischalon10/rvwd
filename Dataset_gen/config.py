"""
Configuration file for the feedback dataset generator.
"""

# OpenAI API Configuration
OPENAI_API_KEY = None  # Set this or use environment variable

# Dataset Generation Settings
DEFAULT_NUM_SCHEMAS = 10
SCHEMA_OUTPUT_DIR = "schemas"
FEEDBACK_OUTPUT_DIR = "feedback_data"

# Business types to focus on for schema generation
FOCUS_BUSINESS_TYPES = [
    "restaurant", "school", "retail_store", "healthcare", "hotel", 
    "gym", "salon", "car_dealership", "online_service", "restaurant_chain"
]
