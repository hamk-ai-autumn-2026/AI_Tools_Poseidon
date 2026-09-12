# Laboratory Information Management System (LIMS) Core Module

## Project Overview

This assignment contains a self-contained Python module (`lab_system.py`) simulating a Laboratory Information Management System core processing unit alongside a comprehensive test suite (`test_lab_system.py`).

### Design & Compliance Standards
* **Style Guide (PEP 8):** Uses explicit type hints, snake_case function/variable naming, PascalCase class naming, and strict line-length limits.
* **Documentation (PEP 287):** Fully documented using reStructuredText (reST) field tags (`:param:`, `:type:`, `:return:`, `:rtype:`, `:raises:`, `:ivar:`) embedded within triple-quoted docstrings.
* **Testing Framework:** Uses `pytest` with parameterized test vectors.

---

## Core Class Architecture (`lab_system.py`)

The core module defines a primary class, `LaboratorySampleProcessor`, and a custom exception class, `InvalidSampleError`.

### Methods Summary
1. `__init__(sample_id, client_name, test_results, metadata)`  
   Initializes sample records with strong fallback defaults for data structures.
2. `validate_sample()`  
   Enforces operational integrity by verifying non-empty strings, valid workflow states, and rejection of non-numeric or `NaN` values.
3. `calculate_statistics()`  
   Computes mean, variance, standard deviation, minimum, maximum, and result counts while gracefully handing floating-point infinity values.
4. `update_status(new_status)`  
   Handles status state transitions with case-insensitive input normalization.
5. `set_metadata_entry(key, value)`  
   Dynamically appends metadata key-value attributes with string key sanitization.
6. `generate_report()`  
   Assembles a complete state report including metadata and calculated statistics.

---

## Test Suite & Edge-Case Strategy (`test_lab_system.py`)

The test suite covers standard operational paths as well as extreme non-standard inputs often missed by standard test coverage tools.

### Test Categories

| Category | Description & Test Objectives |
| :--- | :--- |
| **Smoke Tests** | Verifies basic class instantiation and standard end-to-end sample lifecycle processing. |
| **Unicode & Internationalization** | Tests support for non-Latin characters (Chinese, Arabic, Greek, German Umlauts) and Emojis in string identifiers and metadata fields. |
| **Boundary & Large Data** | Tests resilience against extremely long string inputs (1,000,000 characters) and whitespace-only identifiers. |
| **Special Floating-Point Operations** | Evaluates mathematical handling of `+inf` and `-inf`, ensuring `NaN` values correctly raise an `InvalidSampleError`. |
| **Workflow State Integrity** | Ensures valid status updates succeed while unknown state transitions fail gracefully. |

---

## Execution Instructions

To execute the test suite and verify standard compliance, run the following commands in your terminal:

```bash
# Execute unit and smoke tests
pytest test_lab_system.py -v

# Run with test coverage analysis
pytest --cov=lab_system test_lab_system.py