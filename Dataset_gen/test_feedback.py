#!/usr/bin/env python3
"""
Test script to generate a small sample of feedback data.
"""

from feedback_generator import FeedbackGenerator
import json
import os

def test_small_generation():
    """Generate a small sample of feedback for testing."""
    print("🧪 Testing Feedback Generation")
    print("=" * 35)
    
    # Initialize generator
    generator = FeedbackGenerator()
    
    # Load schemas
    schema_files = [f for f in os.listdir('.') if f.startswith('extraction_schemas_') and f.endswith('.json')]
    if not schema_files:
        print("❌ No schema files found. Run generate.py first.")
        return
    
    latest_schema_file = sorted(schema_files)[-1]
    print(f"📁 Using schema file: {latest_schema_file}")
    
    schemas = generator.load_schemas(latest_schema_file)
    
    # Test with just the first schema and 3 samples
    test_schema = schemas[0]
    print(f"\n🎯 Testing with: {test_schema['business_type']} - {test_schema['schema_name']}")
    
    # Generate small sample with batching
    feedback_samples = generator.generate_feedback_for_schema(test_schema, num_samples=3, batch_size=3)
    
    if feedback_samples:
        print(f"\n✅ Generated {len(feedback_samples)} test samples:")
        for i, sample in enumerate(feedback_samples, 1):
            print(f"\n--- Sample {i} ---")
            print(f"Length: {sample.get('length_category', 'unknown')}")
            print(f"Sentiment: {sample.get('sentiment', 'unknown')}")
            print(f"Style: {sample.get('style', 'unknown')}")
            print(f"Text: {sample['feedback_text'][:100]}...")
        
        # Save test data
        test_file = generator.save_feedback(feedback_samples, "test_feedback.json")
        print(f"\n💾 Test data saved to: {test_file}")
        
        # Show analysis
        analysis = generator.analyze_feedback_diversity(feedback_samples)
        print(f"\n📊 Test Analysis:")
        print(f"   Sentiment: {analysis['sentiment_distribution']}")
        print(f"   Length: {analysis['length_distribution']}")
        print(f"   Style: {analysis['style_distribution']}")
        
    else:
        print("❌ No feedback generated")

if __name__ == "__main__":
    test_small_generation()
