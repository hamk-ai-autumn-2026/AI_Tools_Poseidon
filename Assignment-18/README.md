# Laboratory System Module & Test Suite Overview

## Project Summary

This project includes a Python module (`lab_system.py`) for managing laboratory test samples and a complete unit test suite (`test_lab_system.py`) built with `pytest`.

### Key Features & Standards
* **PEP 8 Compliant:** Clean python code formatting, explicit type hints, and standard naming rules.
* **PEP 287 Docstrings:** Full reStructuredText documentation across all methods and classes using standard tags (`:param:`, `:return:`, `:raises:`).
* **Automated Testing:** Standard smoke tests combined with deep edge-case testing using `pytest`.

---

## What the Code Does (`lab_system.py`)

The main module contains a class called `LaboratorySampleProcessor` and a custom error class `InvalidSampleError`.

### Functions Included:
1. `__init__`: Sets up sample details (IDs, client names, lab measurements, metadata) with safe defaults.
2. `validate_sample`: Makes sure IDs are not blank, statuses are valid, and numbers are usable (blocks missing or `NaN` values).
3. `calculate_statistics`: Finds the mean, standard deviation, variance, min, max, and sample counts. It handles infinity (`inf`) gracefully without crashing.
4. `update_status`: Updates sample status (e.g., from `RECEIVED` to `IN_ANALYSIS`) while ignoring capitalization mistakes.
5. `set_metadata_entry`: Adds custom key-value metadata tags to samples.
6. `generate_report`: Creates a summary dictionary containing all sample attributes and calculated stats.

---

## Test Coverage & Edge Cases (`test_lab_system.py`)

The test file makes sure the code works under normal conditions and doesn't break under unusual inputs:

* **Smoke Tests:** Checks basic initialization and runs a complete sample through the normal workflow.
* **Special Characters & Languages:** Tests Arabic, Chinese, Greek, German, and Emoji text in sample IDs, client names, and metadata keys.
* **Extreme String Sizes:** Verifies that massive text inputs (up to 1,000,000 characters) work without error.
* **Infinity & Special Numbers:** Tests how statistics handle positive infinity (`inf`) and negative infinity (`-inf`), and verifies that `NaN` values are safely rejected.
* **Invalid Data Handling:** Confirms that empty IDs, blank spaces, and unknown statuses correctly raise errors.

---

## How to Run the Tests

Run the following commands in your terminal:

```bash
# Run all tests
pytest test_lab_system.py -v

# Run tests with a coverage report
pytest --cov=lab_system test_lab_system.py