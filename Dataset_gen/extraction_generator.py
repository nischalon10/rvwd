import json
import openai
import os
from typing import List, Dict, Any, Tuple
from datetime import datetime
import time

class ExtractionGenerator:
    def __init__(self, openai_api_key: str = None):
        """Initialize the extraction generator with OpenAI API key."""
        if openai_api_key:
            openai.api_key = openai_api_key
            print("✅ Using provided OpenAI API key")
        elif os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
            print("✅ Using OpenAI API key from environment")
        else:
            print("⚠️  No OpenAI API key detected. Extraction generation will be limited.")
            print("   To use OpenAI: export OPENAI_API_KEY='your_key_here'")
    
    def extract_values_from_feedback(self, feedback_text: str, extraction_schema: Dict[str, Any]) -> Dict[str, Any]:
        """Extract values from feedback text according to the extraction schema."""
        
        # Create a detailed prompt for extraction
        prompt = f"""
        You are an expert at extracting structured data from customer feedback. 
        
        Given this feedback text:
        "{feedback_text}"
        
        And this extraction schema:
        {json.dumps(extraction_schema, indent=2)}
        
        Extract the correct values for each field according to the schema:
        
        RULES:
        1. For "number" fields: Extract a number between min and max, or infer from qualitative language
        2. For "string" with enum: Choose the most appropriate option from the enum
        3. For "array" fields: Extract specific items mentioned as a list of strings
        4. For "string" fields: Extract relevant text or generate appropriate response
        
        QUALITATIVE TO NUMERICAL MAPPING:
        - "amazing", "excellent", "fantastic", "perfect" → 9-10
        - "great", "very good", "really good" → 7-8
        - "good", "nice", "decent" → 6-7
        - "okay", "alright", "average", "fine" → 5-6
        - "not great", "disappointing", "poor" → 3-4
        - "terrible", "awful", "horrible" → 1-2
        
        SENTIMENT MAPPING:
        - Positive words (amazing, great, love, fantastic) → "positive"
        - Negative words (terrible, awful, hate, disappointing) → "negative"
        - Neutral/mixed words (okay, alright, average, fine) → "neutral"
        
        Return ONLY a JSON object with the extracted values, no other text.
        Example: {{"usabilityScore": 8, "sentiment": "positive", "painPoints": ["slow loading"], "suggestions": "Add dark mode"}}
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # Low temperature for consistent extraction
                max_tokens=500
            )
            
            extracted_values = json.loads(response.choices[0].message.content)
            return extracted_values
            
        except Exception as e:
            print(f"❌ Error extracting values: {e}")
            return {}
    
    def create_training_examples(self, feedback_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create training examples from feedback data."""
        training_examples = []
        
        print(f"🔄 Creating training examples from {len(feedback_data)} feedback samples...")
        
        for i, feedback in enumerate(feedback_data, 1):
            print(f"Processing {i}/{len(feedback_data)}: {feedback.get('business_type', 'unknown')}")
            
            # Extract the schema and feedback text
            extraction_schema = feedback.get('extraction_schema', {})
            feedback_text = feedback.get('feedback_text', '')
            
            if not extraction_schema or not feedback_text:
                print(f"⚠️  Skipping feedback {i} - missing schema or text")
                continue
            
            # Extract values using AI
            extracted_values = self.extract_values_from_feedback(feedback_text, extraction_schema)
            
            if not extracted_values:
                print(f"⚠️  Skipping feedback {i} - extraction failed")
                continue
            
            # Create training example
            training_example = {
                "input": {
                    "schema": extraction_schema,
                    "feedback_text": feedback_text
                },
                "output": extracted_values,
                "metadata": {
                    "business_type": feedback.get('business_type', 'unknown'),
                    "length_category": feedback.get('length_category', 'unknown'),
                    "sentiment": feedback.get('sentiment', 'unknown'),
                    "includes_explicit_scores": feedback.get('includes_explicit_scores', False),
                    "original_feedback_id": i
                }
            }
            
            training_examples.append(training_example)
            
            # Rate limiting
            if i % 10 == 0:
                print(f"⏳ Processed {i} examples, waiting 1 second...")
                time.sleep(1)
        
        print(f"✅ Created {len(training_examples)} training examples!")
        return training_examples
    
    def save_training_data(self, training_examples: List[Dict[str, Any]], filename: str = None) -> str:
        """Save training data to JSON file."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"training_data_{timestamp}.json"
        
        filepath = os.path.join(os.path.dirname(__file__), filename)
        
        with open(filepath, 'w') as f:
            json.dump(training_examples, f, indent=2)
        
        print(f"💾 Saved {len(training_examples)} training examples to {filepath}")
        return filepath
    
    def analyze_training_data(self, training_examples: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze the quality and diversity of training data."""
        if not training_examples:
            return {}
        
        # Count by various dimensions
        business_type_counts = {}
        sentiment_counts = {}
        length_counts = {}
        score_distributions = {}
        
        for example in training_examples:
            metadata = example.get('metadata', {})
            output = example.get('output', {})
            
            # Business type
            biz_type = metadata.get('business_type', 'unknown')
            business_type_counts[biz_type] = business_type_counts.get(biz_type, 0) + 1
            
            # Sentiment
            sentiment = metadata.get('sentiment', 'unknown')
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
            
            # Length
            length = metadata.get('length_category', 'unknown')
            length_counts[length] = length_counts.get(length, 0) + 1
            
            # Score distributions (for number fields)
            for field_name, field_value in output.items():
                if isinstance(field_value, (int, float)) and 'score' in field_name.lower():
                    if field_name not in score_distributions:
                        score_distributions[field_name] = []
                    score_distributions[field_name].append(field_value)
        
        # Calculate score statistics
        score_stats = {}
        for field_name, scores in score_distributions.items():
            if scores:
                score_stats[field_name] = {
                    'min': min(scores),
                    'max': max(scores),
                    'avg': sum(scores) / len(scores),
                    'count': len(scores)
                }
        
        analysis = {
            'total_examples': len(training_examples),
            'business_type_distribution': business_type_counts,
            'sentiment_distribution': sentiment_counts,
            'length_distribution': length_counts,
            'score_distributions': score_stats
        }
        
        return analysis

def main():
    """Main function to create training data."""
    print("🎯 Training Data Generator")
    print("=" * 30)
    
    # Initialize generator
    generator = ExtractionGenerator()
    
    # Load feedback data
    feedback_files = [f for f in os.listdir('.') if f.startswith('feedback_data_') and f.endswith('.json')]
    if not feedback_files:
        print("❌ No feedback files found. Run feedback_generator.py first.")
        return
    
    # Use the most recent feedback file
    latest_feedback_file = sorted(feedback_files)[-1]
    print(f"📁 Using feedback file: {latest_feedback_file}")
    
    with open(latest_feedback_file, 'r') as f:
        feedback_data = json.load(f)
    
    print(f"📊 Loaded {len(feedback_data)} feedback samples")
    
    # Create training examples
    training_examples = generator.create_training_examples(feedback_data)
    
    # Save training data
    training_file = generator.save_training_data(training_examples)
    
    # Analyze training data
    analysis = generator.analyze_training_data(training_examples)
    
    print(f"\n📊 Training Data Analysis:")
    print(f"   Total examples: {analysis['total_examples']}")
    print(f"   Business types: {analysis['business_type_distribution']}")
    print(f"   Sentiments: {analysis['sentiment_distribution']}")
    print(f"   Lengths: {analysis['length_distribution']}")
    
    if analysis['score_distributions']:
        print(f"\n📈 Score Distributions:")
        for field, stats in analysis['score_distributions'].items():
            print(f"   {field}: {stats['min']}-{stats['max']} (avg: {stats['avg']:.1f}, count: {stats['count']})")
    
    return training_examples

if __name__ == "__main__":
    main()
