#!/usr/bin/env python3
"""
Test script to demonstrate the extraction process.
"""

from extraction_generator import ExtractionGenerator
import json
import os

def test_extraction():
    """Test extraction with a few examples."""
    print("🧪 Testing Extraction Process")
    print("=" * 35)
    
    # Initialize generator
    generator = ExtractionGenerator()
    
    # Load test feedback data
    if os.path.exists('test_feedback.json'):
        with open('test_feedback.json', 'r') as f:
            feedback_data = json.load(f)
    else:
        print("❌ No test_feedback.json found. Run test_feedback.py first.")
        return
    
    print(f"📁 Loaded {len(feedback_data)} test feedback samples")
    
    # Test extraction on first few samples
    test_samples = feedback_data[:2]  # Test with first 2 samples
    
    for i, feedback in enumerate(test_samples, 1):
        print(f"\n--- Testing Sample {i} ---")
        print(f"Business: {feedback.get('business_type', 'unknown')}")
        print(f"Text: {feedback['feedback_text'][:100]}...")
        
        # Extract values
        extraction_schema = feedback.get('extraction_schema', {})
        extracted_values = generator.extract_values_from_feedback(
            feedback['feedback_text'], 
            extraction_schema
        )
        
        print(f"Extracted values: {extracted_values}")
        
        # Show the training example format
        training_example = {
            "input": {
                "schema": extraction_schema,
                "feedback_text": feedback['feedback_text']
            },
            "output": extracted_values,
            "metadata": {
                "business_type": feedback.get('business_type', 'unknown'),
                "length_category": feedback.get('length_category', 'unknown'),
                "sentiment": feedback.get('sentiment', 'unknown'),
                "includes_explicit_scores": feedback.get('includes_explicit_scores', False)
            }
        }
        
        print(f"Training example format:")
        print(f"  Input schema fields: {list(extraction_schema.keys())}")
        print(f"  Output values: {list(extracted_values.keys())}")
        print(f"  Match: {set(extraction_schema.keys()) == set(extracted_values.keys())}")

if __name__ == "__main__":
    test_extraction()
