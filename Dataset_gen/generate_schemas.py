import json
import openai
import random
from typing import List, Dict, Any
import os
from datetime import datetime

class FeedbackDatasetGenerator:
    def __init__(self, openai_api_key: str = None):
        """Initialize the dataset generator with OpenAI API key."""
        if openai_api_key:
            openai.api_key = openai_api_key
            print("✅ Using provided OpenAI API key")
        elif os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
            print("✅ Using OpenAI API key from environment")
        else:
            print("⚠️  No OpenAI API key detected. Schema generation will be limited.")
            print("   To use OpenAI: export OPENAI_API_KEY='your_key_here'")
        
        self.base_schemas = self._create_base_schemas()
    
    def _create_base_schemas(self) -> List[Dict[str, Any]]:
        """Create example extraction schemas for different business types."""
        return [
            {
                "business_type": "App",
                "schema_name": "App Usability Study",
                "extractionSchema": {
                    "usabilityScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "painPoints": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
    }
            },
            {
                "business_type": "University",
                "schema_name": "Course Evaluation",
                "extractionSchema": {
                    "teachingQualityScore": {"type": "number", "min": 1, "max": 10},
                    "curriculumContentScore": {"type": "number", "min": 1, "max": 10},
                    "ClarityScore": {"type": "number", "min": 1, "max": 10},
                    "EngagementScore": {"type": "number", "min": 1, "max": 10},
                    "Satisfaction": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "improvementAreas": {"type": "array", "items": {"type": "string"}},
                    "strengths": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            },
            {
                "business_type": "retail_store",
                "schema_name": "Retail Customer Experience",
                "extractionSchema": {
                    "productAvailabilityScore": {"type": "number", "min": 1, "max": 10},
                    "staffHelpfulnessScore": {"type": "number", "min": 1, "max": 10},
                    "storeOrganizationScore": {"type": "number", "min": 1, "max": 10},
                    "checkoutExperienceScore": {"type": "number", "min": 1, "max": 10},
                    "valuePerceptionScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "complaints": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            },
            {
                "business_type": "healthcare",
                "schema_name": "Healthcare Service Assessment",
                "extractionSchema": {
                    "medicalCareScore": {"type": "number", "min": 1, "max": 10},
                    "staffProfessionalismScore": {"type": "number", "min": 1, "max": 10},
                    "waitTimeScore": {"type": "number", "min": 1, "max": 10},
                    "CleanlinessScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "concerns": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            }
        ]
    
    def generate_additional_schemas(self, num_schemas: int = 5, batch_size: int = 5) -> List[Dict[str, Any]]:
        """Generate additional extraction schemas using OpenAI in batches."""
        if not openai.api_key:
            print("No OpenAI API key available. Returning base schemas only.")
            return []
        
        all_generated_schemas = []
        remaining_schemas = num_schemas
        
        while remaining_schemas > 0:
            current_batch_size = min(batch_size, remaining_schemas)
            
            prompt = f"""
            You are creating extraction schemas for a feedback analysis service. Each schema should be designed to extract specific metrics from voice feedback about different types of businesses.

            Here are examples of the format:

            {json.dumps(self.base_schemas[0], indent=2)}

            Generate exactly {current_batch_size} different extraction schemas for various business types. Each schema should:
            1. Have a unique business_type (different from the examples and previous batches)
            2. Have a descriptive schema_name
            3. Include an extractionSchema object with 4-8 metrics using any variety of these types:
               - "number" with min/max (1-10 scale for scores)
               - "string" with enum for categorical values like sentiment
               - "array" with items type "string" for lists of items
               - "string" for free text suggestions
            4. Cover different industries like: hotels, gyms, salons, car dealerships, online services, etc.
            5. Use camelCase for field names
            6. Include at least one sentiment field with enum ["positive", "negative", "neutral"]
            7. Include arrays for pain points, issues, or positive aspects
            8. Include a suggestions field for free text

            Return only the JSON array of schemas, no other text.
            """
            
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1500,
                    temperature=0.8
                )
                
                generated_schemas = json.loads(response.choices[0].message.content)
                all_generated_schemas.extend(generated_schemas)
                remaining_schemas -= len(generated_schemas)
                
                print(f"Generated {len(generated_schemas)} schemas in this batch. {remaining_schemas} remaining.")
                
                # Small delay to respect rate limits
                import time
                time.sleep(1)
                
            except Exception as e:
                print(f"Error generating schemas with OpenAI: {e}")
                break
        
        return all_generated_schemas
    
    def create_more_base_schemas(self) -> List[Dict[str, Any]]:
        """Create additional base schemas programmatically to reduce OpenAI dependency."""
        additional_schemas = [
            {
                "business_type": "hotel",
                "schema_name": "Hotel Experience Evaluation",
                "extractionSchema": {
                    "roomQualityScore": {"type": "number", "min": 1, "max": 10},
                    "serviceScore": {"type": "number", "min": 1, "max": 10},
                    "amenitiesScore": {"type": "number", "min": 1, "max": 10},
                    "locationScore": {"type": "number", "min": 1, "max": 10},
                    "valueScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "issues": {"type": "array", "items": {"type": "string"}},
                    "highlights": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            },
            {
                "business_type": "gym",
                "schema_name": "Fitness Center Assessment",
                "extractionSchema": {
                    "equipmentQualityScore": {"type": "number", "min": 1, "max": 10},
                    "cleanlinessScore": {"type": "number", "min": 1, "max": 10},
                    "staffHelpfulnessScore": {"type": "number", "min": 1, "max": 10},
                    "atmosphereScore": {"type": "number", "min": 1, "max": 10},
                    "valueScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "complaints": {"type": "array", "items": {"type": "string"}},
                    "positiveAspects": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            },
            {
                "business_type": "salon",
                "schema_name": "Beauty Salon Experience",
                "extractionSchema": {
                    "serviceQualityScore": {"type": "number", "min": 1, "max": 10},
                    "stylistSkillScore": {"type": "number", "min": 1, "max": 10},
                    "cleanlinessScore": {"type": "number", "min": 1, "max": 10},
                    "customerServiceScore": {"type": "number", "min": 1, "max": 10},
                    "valueScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "issues": {"type": "array", "items": {"type": "string"}},
                    "compliments": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            },
            {
                "business_type": "car_dealership",
                "schema_name": "Automotive Sales Experience",
                "extractionSchema": {
                    "salesProcessScore": {"type": "number", "min": 1, "max": 10},
                    "staffKnowledgeScore": {"type": "number", "min": 1, "max": 10},
                    "vehicleQualityScore": {"type": "number", "min": 1, "max": 10},
                    "pricingTransparencyScore": {"type": "number", "min": 1, "max": 10},
                    "overallExperienceScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "concerns": {"type": "array", "items": {"type": "string"}},
                    "positiveHighlights": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            },
            {
                "business_type": "online_service",
                "schema_name": "Digital Platform Usability",
                "extractionSchema": {
                    "usabilityScore": {"type": "number", "min": 1, "max": 10},
                    "performanceScore": {"type": "number", "min": 1, "max": 10},
                    "designScore": {"type": "number", "min": 1, "max": 10},
                    "functionalityScore": {"type": "number", "min": 1, "max": 10},
                    "valueScore": {"type": "number", "min": 1, "max": 10},
                    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                    "painPoints": {"type": "array", "items": {"type": "string"}},
                    "positiveFeatures": {"type": "array", "items": {"type": "string"}},
                    "suggestions": {"type": "string"}
                }
            }
        ]
        return additional_schemas
    
    def save_schemas(self, schemas: List[Dict[str, Any]], filename: str = None) -> str:
        """Save schemas to a JSON file."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"extraction_schemas_{timestamp}.json"
        
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        with open(filepath, 'w') as f:
            json.dump(schemas, f, indent=2)
        
        print(f"Saved {len(schemas)} schemas to {filepath}")
        return filepath
    
    def load_schemas(self, filename: str) -> List[Dict[str, Any]]:
        """Load schemas from a JSON file."""
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        with open(filepath, 'r') as f:
            schemas = json.load(f)
        
        print(f"Loaded {len(schemas)} schemas from {filepath}")
        return schemas
    
    def get_all_schemas(self, use_openai: bool = True, num_openai: int = 5, include_extra_base: bool = True) -> List[Dict[str, Any]]:
        """Get all schemas (base + additional base + OpenAI generated)."""
        all_schemas = self.base_schemas.copy()
        
        if include_extra_base:
            additional_base = self.create_more_base_schemas()
            all_schemas.extend(additional_base)
            print(f"Added {len(additional_base)} additional base schemas")
        
        if use_openai and openai.api_key:
            openai_schemas = self.generate_additional_schemas(num_openai)
            all_schemas.extend(openai_schemas)
            print(f"Generated {len(openai_schemas)} schemas with OpenAI")
        elif use_openai and not openai.api_key:
            print("No OpenAI API key - skipping AI generation")
        
        return all_schemas

def main():
    """Main function to demonstrate the dataset generator."""
    # Initialize the generator
    generator = FeedbackDatasetGenerator()
    
    print("=== Feedback Dataset Generator ===")
    print(f"Base schemas available: {len(generator.base_schemas)}")
    
    # Display base schemas
    print("\nBase schemas:")
    for schema in generator.base_schemas:
        print(f"- {schema['business_type']}: {schema['schema_name']}")
    
    # Get all schemas (base + additional base + OpenAI)
    print(f"\nGenerating comprehensive schema set...")
    all_schemas = generator.get_all_schemas(use_openai=True, num_openai=5, include_extra_base=True)
    
    # Display all schemas
    print(f"\nAll schemas ({len(all_schemas)} total):")
    for i, schema in enumerate(all_schemas, 1):
        print(f"{i:2d}. {schema['business_type']}: {schema['schema_name']}")
    
    # Save all schemas
    filename = generator.save_schemas(all_schemas)
    
    print(f"\n✅ Total schemas: {len(all_schemas)}")
    print(f"💾 Saved to: {filename}")
    
    # Show limitations
    print(f"\n📊 Schema Generation Limits:")
    print(f"   • Base schemas: {len(generator.base_schemas)} (always available)")
    print(f"   • Additional base: 5 (programmatically created)")
    print(f"   • OpenAI generated: 5-15 (depends on API limits)")
    print(f"   • Total realistic max: ~25-30 schemas")
    
    return all_schemas

if __name__ == "__main__":
    main()
