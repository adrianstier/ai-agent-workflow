# Data Science Agent Suite (Agents 21-27)

A specialized suite of 7 AI agents for end-to-end data science and machine learning workflows.

## Overview

| Agent | Name | Purpose |
|-------|------|---------|
| **21** | DS Orchestrator | Coordinates data science projects, selects methodology |
| **22** | Data Explorer | EDA, data profiling, quality assessment |
| **23** | Feature Engineer | Feature creation, selection, transformation |
| **24** | Model Architect | Model selection, architecture design, hyperparameter strategy |
| **25** | ML Engineer | Model implementation, training, optimization |
| **26** | Model Evaluator | Evaluation, validation, bias detection, interpretability |
| **27** | MLOps Engineer | Deployment, monitoring, CI/CD for ML |

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DS Orchestrator (21)                          │
│              Coordinates entire ML pipeline                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Data        │  │ Feature     │  │ Model       │
│ Explorer    │→ │ Engineer    │→ │ Architect   │
│ (22)        │  │ (23)        │  │ (24)        │
└─────────────┘  └─────────────┘  └─────────────┘
                                         │
                         ┌───────────────┼───────────────┐
                         ▼               ▼               ▼
                 ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                 │ ML          │  │ Model       │  │ MLOps       │
                 │ Engineer    │→ │ Evaluator   │→ │ Engineer    │
                 │ (25)        │  │ (26)        │  │ (27)        │
                 └─────────────┘  └─────────────┘  └─────────────┘
```

## When to Use Each Agent

### Agent 21: DS Orchestrator
**Use when:**
- Starting a new data science project
- Unsure which methodology fits (regression, classification, clustering, etc.)
- Need to plan the ML pipeline
- Stuck or need direction

**Output:** Project plan, methodology selection, agent routing

### Agent 22: Data Explorer
**Use when:**
- First encountering a new dataset
- Need comprehensive EDA
- Assessing data quality issues
- Understanding distributions and relationships

**Output:** `artifacts/data-exploration-v0.1.md`, visualizations, quality report

### Agent 23: Feature Engineer
**Use when:**
- Raw features aren't predictive enough
- Need domain-specific transformations
- Handling categorical encoding
- Dimensionality reduction needed

**Output:** `artifacts/feature-engineering-v0.1.md`, feature pipeline code

### Agent 24: Model Architect
**Use when:**
- Choosing between model families
- Designing neural network architectures
- Planning ensemble strategies
- Defining hyperparameter search space

**Output:** `artifacts/model-architecture-v0.1.md`, architecture diagrams

### Agent 25: ML Engineer
**Use when:**
- Ready to implement and train models
- Optimizing training pipelines
- Handling distributed training
- GPU/TPU optimization

**Output:** Training code, model artifacts, training logs

### Agent 26: Model Evaluator
**Use when:**
- Model is trained, need rigorous evaluation
- Checking for bias and fairness
- Need interpretability/explainability
- Validating on holdout sets

**Output:** `artifacts/model-evaluation-v0.1.md`, evaluation metrics, SHAP/LIME plots

### Agent 27: MLOps Engineer
**Use when:**
- Ready to deploy to production
- Setting up model monitoring
- Building ML CI/CD pipelines
- Managing model versioning

**Output:** `artifacts/mlops-plan-v0.1.md`, deployment configs, monitoring dashboards

## Quick Start

### With Orchestrator-Driven Mode (Recommended)

```bash
# In your data science project
agent-add

# Start Claude Code
claude
```

Then tell the orchestrator:
```
I have a dataset of customer transactions and want to predict churn.
The data is in data/transactions.csv with 50K rows.
I need a production model within 2 weeks.

Let's start with data exploration.
```

### Manual Mode

1. Start with Agent 21 (DS Orchestrator) to plan your approach
2. Follow the recommended agent sequence
3. Save artifacts as you progress

## Integration with Core Agents

The DS agents integrate with the core development agents:

- **Agent 5 (System Architect)** → Agent 24 for ML system design
- **Agent 6 (Engineer)** → Agent 25 for ML implementation
- **Agent 7 (QA)** → Agent 26 for model validation
- **Agent 8 (DevOps)** → Agent 27 for MLOps

## Typical Project Flow

### Week 1: Discovery & Data Understanding
```
Agent 21 → Project scoping, methodology selection
Agent 22 → EDA, data quality assessment
Agent 23 → Initial feature engineering
```

### Week 2: Modeling
```
Agent 24 → Model architecture decisions
Agent 25 → Model training and optimization
Agent 26 → Evaluation and validation
```

### Week 3: Production
```
Agent 27 → Deployment and monitoring
Agent 26 → Production validation
Agent 21 → Iteration planning
```

## Best Practices

1. **Always start with EDA** - Agent 22 before any modeling
2. **Document assumptions** - Each agent logs decisions
3. **Version everything** - Data, features, models, configs
4. **Validate continuously** - Agent 26 at each stage
5. **Plan for production** - Consider MLOps from the start

## Artifacts Structure

```
project/
├── artifacts/
│   ├── ds-project-plan-v0.1.md      # From Agent 21
│   ├── data-exploration-v0.1.md     # From Agent 22
│   ├── feature-engineering-v0.1.md  # From Agent 23
│   ├── model-architecture-v0.1.md   # From Agent 24
│   ├── model-evaluation-v0.1.md     # From Agent 26
│   └── mlops-plan-v0.1.md           # From Agent 27
├── data/
│   ├── raw/
│   ├── processed/
│   └── features/
├── models/
│   ├── checkpoints/
│   └── exported/
├── notebooks/
│   └── exploration.ipynb
└── src/
    ├── features/
    ├── models/
    └── evaluation/
```
