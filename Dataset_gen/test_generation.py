#!/usr/bin/env python3
"""
Test script for the feedback dataset generator.
Run this to test schema generation without requiring OpenAI API.
"""

import json
from generate import FeedbackDatasetGenerator

def test_base_schemas():
    """Test that base schemas are properly created."""
    print("Testing base schema creation...")
    
    generator = FeedbackDatasetGenerator()
    schemas = generator.base_schemas
    
    print(f"✓ Created {len(schemas)} base schemas")
    
    for schema in schemas:
        print(f"  - {schema['business_type']}: {schema['schema_name']}")
        print(f"    Metrics: {len(schema['extractionSchema'])}")
    
    return schemas

def test_schema_structure():
    """Test that schemas have the correct structure."""
    print("\nTesting schema structure...")
    
    generator = FeedbackDatasetGenerator()
    schemas = generator.base_schemas
    
    required_fields = ['business_type', 'schema_name', 'extractionSchema']
    number_fields = ['type', 'min', 'max']
    string_enum_fields = ['type', 'enum']
    array_fields = ['type', 'items']
    string_fields = ['type']
    
    for schema in schemas:
        # Check top-level fields
        for field in required_fields:
            assert field in schema, f"Missing field: {field}"
        
        # Check extraction schema structure
        extraction_schema = schema['extractionSchema']
        for metric_name, metric_config in extraction_schema.items():
            assert 'type' in metric_config, f"Missing type field in {metric_name}"
            
            # Check based on type
            if metric_config['type'] == 'number':
                for field in number_fields:
                    assert field in metric_config, f"Missing {field} field in number metric {metric_name}"
                assert metric_config['min'] == 1 and metric_config['max'] == 10, f"Number scale should be 1-10 for {metric_name}"
            elif metric_config['type'] == 'string' and 'enum' in metric_config:
                for field in string_enum_fields:
                    assert field in metric_config, f"Missing {field} field in string enum metric {metric_name}"
                assert metric_config['enum'] == ["positive", "negative", "neutral"], f"Sentiment enum should be positive/negative/neutral for {metric_name}"
            elif metric_config['type'] == 'array':
                for field in array_fields:
                    assert field in metric_config, f"Missing {field} field in array metric {metric_name}"
                assert metric_config['items']['type'] == 'string', f"Array items should be strings for {metric_name}"
            elif metric_config['type'] == 'string':
                assert len(metric_config) == 1, f"String field should only have type for {metric_name}"
    
    print("✓ All schemas have correct structure")

def test_save_load():
    """Test saving and loading schemas."""
    print("\nTesting save/load functionality...")
    
    generator = FeedbackDatasetGenerator()
    schemas = generator.base_schemas
    
    # Save schemas
    filename = generator.save_schemas(schemas, "test_schemas.json")
    print(f"✓ Saved schemas to {filename}")
    
    # Load schemas
    loaded_schemas = generator.load_schemas("test_schemas.json")
    print(f"✓ Loaded {len(loaded_schemas)} schemas")
    
    # Verify they match
    assert len(loaded_schemas) == len(schemas), "Schema count mismatch"
    print("✓ Save/load test passed")
    
    # Clean up
    import os
    os.remove(filename)
    print("✓ Cleaned up test file")

def main():
    """Run all tests."""
    print("=== Testing Feedback Dataset Generator ===\n")
    
    try:
        test_base_schemas()
        test_schema_structure()
        test_save_load()
        
        print("\n🎉 All tests passed!")
        print("\nTo use with OpenAI API:")
        print("1. Set OPENAI_API_KEY environment variable")
        print("2. Run: python generate.py")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
