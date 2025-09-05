# Feedback Dataset Generator

A comprehensive system for generating training datasets for feedback analysis models. This project creates realistic voice feedback data and corresponding extraction schemas for fine-tuning AI models that analyze customer feedback.

## 🎯 Overview

This system generates:
- **Extraction Schemas**: JSON schemas defining what metrics to extract from feedback
- **Realistic Feedback**: Natural voice-to-text style customer feedback
- **Training Data**: Complete input/output pairs for model fine-tuning

Perfect for services like rvwd that need to analyze voice feedback and extract structured metrics.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set up OpenAI API
```bash
export OPENAI_API_KEY="your_api_key_here"
```

### 3. Generate Complete Dataset
```bash
python3 generate_schemas.py    # Generate extraction schemas
python3 feedback_generator.py  # Generate feedback data
python3 extraction_generator.py  # Create training data
```

**Note**: Generated files are saved in the `data/` directory.

## 📁 Project Structure

```
Dataset_gen/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── generate_schemas.py               # Schema generation system
├── feedback_generator.py             # Feedback generation system
├── extraction_generator.py           # Training data creation
├── test_generation.py               # Test schema generation
├── test_feedback.py                 # Test feedback generation
├── test_extraction.py               # Test extraction process
├── config.py                        # Configuration settings
├── feedback_config.py               # Feedback generation config
└── data/                           # Generated datasets
    ├── extraction_schemas_*.json    # Generated schemas
    ├── feedback_data_*.json         # Generated feedback
    └── training_data_*.json         # Complete training dataset
```

## 🔧 Core Components

### 1. Schema Generation (`generate_schemas.py`)
Creates extraction schemas for different business types:

**Features:**
- 4 base schemas (App, University, Retail, Healthcare)
- 5 additional programmatic schemas (Hotel, Gym, Salon, Car Dealership, Online Service)
- OpenAI integration for generating more schemas
- Consistent JSON schema format

**Example Schema:**
```json
{
  "business_type": "App",
  "schema_name": "App Usability Study",
  "extractionSchema": {
    "usabilityScore": {"type": "number", "min": 1, "max": 10},
    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
    "painPoints": {"type": "array", "items": {"type": "string"}},
    "suggestions": {"type": "string"}
  }
}
```

### 2. Feedback Generation (`feedback_generator.py`)
Generates realistic voice feedback for each schema:

**Features:**
- Batching system (5 samples per API call)
- Retry logic with exponential backoff
- Diverse content: length, sentiment, style
- Natural voice-to-text style
- Rate limiting and error handling

**Generated Feedback:**
- **Length**: Short (30-60s), Medium (1-3min), Long (3-5min)
- **Sentiment**: Positive, negative, neutral
- **Style**: Casual, formal, emotional, matter-of-fact
- **Content**: Mix of explicit scores and qualitative language

### 3. Extraction Generation (`extraction_generator.py`)
Creates training data by extracting correct values:

**Features:**
- AI-powered extraction using OpenAI
- Qualitative to numerical mapping
- Schema-compliant output format
- Comprehensive error handling

**Training Data Format:**
```json
{
  "input": {
    "schema": {...},
    "feedback_text": "I loved this app! It was so easy to use..."
  },
  "output": {
    "usabilityScore": 9,
    "sentiment": "positive",
    "painPoints": [],
    "suggestions": "Add dark mode"
  },
  "metadata": {
    "business_type": "App",
    "length_category": "medium",
    "sentiment": "positive"
  }
}
```

## 📊 Generated Dataset

### Statistics
- **Total Examples**: 210 training samples
- **Business Types**: 14 different industries
- **Sentiment Distribution**: 84 positive, 59 negative, 66 neutral, 1 mixed
- **Length Distribution**: 38 short, 122 medium, 50 long
- **File Size**: ~0.3 MB

### Business Types Covered
- App, University, Retail Store, Healthcare
- Hotel, Gym, Salon, Car Dealership, Online Service
- Plus additional AI-generated variations

### Score Distributions
All numerical scores range from 1-10 with realistic distributions:
- Average scores: 5.5-7.5 (realistic range)
- Full range coverage: 1-10
- Balanced positive/negative examples

## 🧪 Testing

### Test Schema Generation
```bash
python3 test_generation.py
```

### Test Feedback Generation
```bash
python3 test_feedback.py
```

### Test Extraction Process
```bash
python3 test_extraction.py
```

## ⚙️ Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for AI generation

### Customization
Edit `config.py` and `feedback_config.py` to adjust:
- Number of samples per schema
- Batch sizes
- Rate limiting delays
- Business type focus

## 💰 Cost Estimation

- **Without OpenAI**: Free (9 schemas, limited feedback)
- **With OpenAI**: ~$0.50-2.00 for complete dataset
- **Per 100 samples**: ~$0.25

## 🎯 Use Cases

### Model Fine-tuning
Perfect for training models to:
- Extract structured data from voice feedback
- Map qualitative language to numerical scores
- Handle diverse business contexts
- Process natural speech patterns

### Business Applications
- Customer feedback analysis
- Voice-to-metrics conversion
- Automated sentiment analysis
- Multi-industry feedback processing

## 🔄 Workflow

1. **Generate Schemas**: Create extraction schemas for different business types
2. **Generate Feedback**: Create realistic voice feedback for each schema
3. **Extract Values**: Use AI to extract correct values from feedback
4. **Create Training Data**: Combine schemas, feedback, and extractions
5. **Fine-tune Model**: Use the training data to train your model

## 🛠️ Troubleshooting

### Common Issues

**JSON Parsing Error**: 
- Usually indicates API rate limiting
- System includes retry logic and error handling
- Check OpenAI API key and quota

**Empty Responses**:
- API may be hitting rate limits
- System will retry automatically
- Check internet connection

**Schema Mismatch**:
- Ensure all schemas follow the correct format
- Check that extraction schemas match feedback schemas

## 📈 Future Enhancements

- Support for more business types
- Custom schema templates
- Multi-language feedback generation
- Advanced sentiment analysis
- Real-time feedback processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the test scripts
3. Check OpenAI API status
4. Verify your API key and quota

---

**Generated by the Feedback Dataset Generator** 🎤📊