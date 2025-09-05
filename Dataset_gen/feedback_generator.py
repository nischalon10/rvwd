import json
import openai
import random
import os
from typing import List, Dict, Any, Tuple
from datetime import datetime
import time

class FeedbackGenerator:
    def __init__(self, openai_api_key: str = None):
        """Initialize the feedback generator with OpenAI API key."""
        if openai_api_key:
            openai.api_key = openai_api_key
            print("✅ Using provided OpenAI API key")
        elif os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
            print("✅ Using OpenAI API key from environment")
        else:
            print("⚠️  No OpenAI API key detected. Feedback generation will be limited.")
            print("   To use OpenAI: export OPENAI_API_KEY='your_key_here'")
    
    def load_schemas(self, schema_file: str) -> List[Dict[str, Any]]:
        """Load schemas from a JSON file."""
        with open(schema_file, 'r') as f:
            schemas = json.load(f)
        print(f"📁 Loaded {len(schemas)} schemas from {schema_file}")
        return schemas
    
    def generate_feedback_for_schema(self, schema: Dict[str, Any], num_samples: int = 10, batch_size: int = 5) -> List[Dict[str, Any]]:
        """Generate diverse feedback samples for a specific schema in batches."""
        business_type = schema['business_type']
        schema_name = schema['schema_name']
        extraction_schema = schema['extractionSchema']
        
        print(f"\n🎯 Generating {num_samples} feedback samples for {business_type} (batch size: {batch_size})...")
        
        all_feedback = []
        remaining_samples = num_samples
        
        while remaining_samples > 0:
            current_batch_size = min(batch_size, remaining_samples)
            
            # Create prompt for diverse feedback generation
            prompt = f"""
            You are generating realistic voice feedback for a {business_type} business. 
            The feedback will be analyzed using this extraction schema: {schema_name}
            
            Schema fields to consider:
            {json.dumps(extraction_schema, indent=2)}
            
            Generate exactly {current_batch_size} diverse feedback samples that vary in:
            1. **Length**: 30 seconds to 5 minutes of speech (50-500 words)
            2. **Sentiment**: Mix of positive, negative, and neutral
            3. **Content**: Different aspects mentioned (qualitative metrics, pain points, suggestions, best features, positives, issues, areas for improvement)
            4. **Style**: Casual, formal, emotional, matter-of-fact
            5. **Specificity**: Some detailed, some brief
            6. **Rating Style**: Some mention specific scores/numbers, others use qualitative language only
            
            Each feedback should sound like someone speaking into their phone after using the service.
            Make them realistic and varied - some customers are happy, some frustrated, some indifferent.
            
            IMPORTANT: Don't force every feedback to include numerical scores. Some should be purely qualitative:
            - "The food was amazing" (not "I'd rate it 9/10")
            - "The service was terrible" (not "I'd give it a 2")
            - "It was okay, nothing special" (not "I'd say it's a 5")
            
            Mix it up - some feedback should mention specific numbers, others should be purely descriptive.
            
            Return as JSON array with this format:
            [
                {{
                    "feedback_text": "The actual spoken feedback...",
                    "length_category": "short|medium|long",
                    "sentiment": "positive|negative|neutral",
                    "includes_explicit_scores": true|false
                }},
                ...
            ]
            
            Return only the JSON array, no other text.
            """
            
            # Retry logic for API calls
            max_retries = 3
            response = None
            
            for attempt in range(max_retries):
                try:
                    response = openai.ChatCompletion.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.9,  # High temperature for diversity
                        max_tokens=2000
                    )
                    break  # Success, exit retry loop
                except Exception as api_err:
                    if attempt < max_retries - 1:
                        print(f"⚠️  API error (attempt {attempt + 1}/{max_retries}): {api_err}")
                        print(f"   Retrying in {2 ** attempt} seconds...")
                        time.sleep(2 ** attempt)  # Exponential backoff
                    else:
                        print(f"❌ API failed after {max_retries} attempts: {api_err}")
                        continue
            
            if response is None:
                print(f"❌ Failed to get response for {business_type}")
                continue
                
            # Clean the response content
            content = response.choices[0].message.content.strip()
            
            # Check if content is empty
            if not content:
                print(f"⚠️  Empty response from API for {business_type}")
                continue
            
            # Remove any markdown code blocks if present
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            
            # Try to parse JSON
            try:
                generated_feedback = json.loads(content)
            except json.JSONDecodeError as json_err:
                print(f"⚠️  JSON decode error for {business_type}: {json_err}")
                print(f"   Raw content: {content[:200]}...")
                continue
            
            # Validate that we got a list
            if not isinstance(generated_feedback, list):
                print(f"⚠️  Expected list, got {type(generated_feedback)} for {business_type}")
                continue
            
            # Add schema reference to each feedback
            for feedback in generated_feedback:
                feedback['schema_id'] = f"{business_type}_{schema_name}"
                feedback['business_type'] = business_type
                feedback['extraction_schema'] = extraction_schema
            
            all_feedback.extend(generated_feedback)
            remaining_samples -= len(generated_feedback)
            
            print(f"✅ Generated {len(generated_feedback)} samples in this batch. {remaining_samples} remaining.")
            
            # Rate limiting between batches
            if remaining_samples > 0:
                time.sleep(1)
        
        print(f"✅ Total generated for {business_type}: {len(all_feedback)} feedback samples")
        return all_feedback
    
    def generate_all_feedback(self, schemas: List[Dict[str, Any]], samples_per_schema: int = 10, batch_size: int = 5) -> List[Dict[str, Any]]:
        """Generate feedback for all schemas using batching."""
        all_feedback = []
        
        print(f"🚀 Generating feedback for {len(schemas)} schemas...")
        print(f"📊 Target: {samples_per_schema} samples per schema = {len(schemas) * samples_per_schema} total")
        print(f"🔄 Using batch size: {batch_size} samples per API call")
        
        for i, schema in enumerate(schemas, 1):
            print(f"\n--- Schema {i}/{len(schemas)}: {schema['business_type']} ---")
            
            feedback_samples = self.generate_feedback_for_schema(schema, samples_per_schema, batch_size)
            all_feedback.extend(feedback_samples)
            
            # Rate limiting between schemas
            if i < len(schemas):
                print("⏳ Waiting 2 seconds before next schema...")
                time.sleep(2)
        
        print(f"\n🎉 Generated {len(all_feedback)} total feedback samples!")
        return all_feedback
    
    def save_feedback(self, feedback_data: List[Dict[str, Any]], filename: str = None) -> str:
        """Save feedback data to JSON file."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"feedback_data_{timestamp}.json"
        
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        with open(filepath, 'w') as f:
            json.dump(feedback_data, f, indent=2)
        
        print(f"💾 Saved {len(feedback_data)} feedback samples to {filepath}")
        return filepath
    
    def analyze_feedback_diversity(self, feedback_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze the diversity of generated feedback."""
        if not feedback_data:
            return {}
        
        # Count by various dimensions
        sentiment_counts = {}
        length_counts = {}
        style_counts = {}
        business_type_counts = {}
        
        for feedback in feedback_data:
            # Sentiment
            sentiment = feedback.get('sentiment', 'unknown')
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
            
            # Length
            length = feedback.get('length_category', 'unknown')
            length_counts[length] = length_counts.get(length, 0) + 1
            
            # Style
            style = feedback.get('style', 'unknown')
            style_counts[style] = style_counts.get(style, 0) + 1
            
            # Business type
            biz_type = feedback.get('business_type', 'unknown')
            business_type_counts[biz_type] = business_type_counts.get(biz_type, 0) + 1
        
        # Calculate text length statistics
        text_lengths = [len(feedback.get('feedback_text', '').split()) for feedback in feedback_data]
        
        analysis = {
            'total_samples': len(feedback_data),
            'sentiment_distribution': sentiment_counts,
            'length_distribution': length_counts,
            'style_distribution': style_counts,
            'business_type_distribution': business_type_counts,
            'text_length_stats': {
                'min_words': min(text_lengths),
                'max_words': max(text_lengths),
                'avg_words': sum(text_lengths) / len(text_lengths)
            }
        }
        
        return analysis

def main():
    """Main function to generate feedback data."""
    print("🎤 Feedback Generator")
    print("=" * 30)
    
    # Initialize generator
    generator = FeedbackGenerator()
    
    # Load schemas
    schema_files = [f for f in os.listdir('.') if f.startswith('extraction_schemas_') and f.endswith('.json')]
    if not schema_files:
        print("❌ No schema files found. Run generate.py first.")
        return
    
    # Use the most recent schema file
    latest_schema_file = sorted(schema_files)[-1]
    print(f"📁 Using schema file: {latest_schema_file}")
    
    schemas = generator.load_schemas(latest_schema_file)
    
    # Generate feedback with batching
    samples_per_schema = 15  # Adjust based on your needs and API limits
    batch_size = 5  # Samples per API call (adjust based on token limits)
    feedback_data = generator.generate_all_feedback(schemas, samples_per_schema, batch_size)
    
    # Save feedback
    feedback_file = generator.save_feedback(feedback_data)
    
    # Analyze diversity
    analysis = generator.analyze_feedback_diversity(feedback_data)
    
    print(f"\n📊 Diversity Analysis:")
    print(f"   Total samples: {analysis['total_samples']}")
    print(f"   Sentiment: {analysis['sentiment_distribution']}")
    print(f"   Length: {analysis['length_distribution']}")
    print(f"   Style: {analysis['style_distribution']}")
    print(f"   Text length: {analysis['text_length_stats']['min_words']}-{analysis['text_length_stats']['max_words']} words (avg: {analysis['text_length_stats']['avg_words']:.1f})")
    
    return feedback_data

if __name__ == "__main__":
    main()
