"""
Comprehensive Unit and Smoke Test Suite for Laboratory Sample Processor.

Tests edge-cases including non-ASCII Unicode strings, extreme string sizes,
infinite floating-point metrics, and standard workflow paths.
"""

import math
import pytest
from lab_system import LaboratorySampleProcessor, InvalidSampleError


# ============================================================================
# 1. SMOKE TESTS (Basic Verification)
# ============================================================================

def test_smoke_instantiation():
    """Smoke Test: Verify basic instantiation of LaboratorySampleProcessor."""
    processor = LaboratorySampleProcessor(
        sample_id="LAB-1001",
        client_name="Standard Lab Corp"
    )
    assert processor.sample_id == "LAB-1001"
    assert processor.status == "RECEIVED"


def test_smoke_happy_path_pipeline():
    """Smoke Test: Run through a normal sample lifecycle execution."""
    processor = LaboratorySampleProcessor(
        sample_id="LAB-9999",
        client_name="BioTech Direct",
        test_results=[12.5, 14.1, 13.0]
    )
    assert processor.validate_sample() is True
    processor.update_status("IN_ANALYSIS")
    stats = processor.calculate_statistics()
    assert stats["count"] == 3.0
    report = processor.generate_report()
    assert report["status"] == "IN_ANALYSIS"


# ============================================================================
# 2. UNIT TESTS: Unicode, Non-ASCII, and Special Character Inputs
# ============================================================================

@pytest.mark.parametrize("unicode_id, client", [
    ("样本-2026-🧪", "上海生物科技"),          # Chinese / Emoji
    ("عينة-123456", "مختبر الأبحاث"),         # Arabic
    ("Δεῖγμα-ALPHA", "Εργαστήριο 🔬"),       # Greek
    ("ÖÄÜ_Sample", "München Labor GmbH"),      # German Umlauts
])
def test_unicode_sample_identifiers_and_clients(unicode_id, client):
    """Verify system handles non-ASCII and internationalized Unicode values."""
    processor = LaboratorySampleProcessor(
        sample_id=unicode_id,
        client_name=client,
        test_results=[1.0, 2.0]
    )
    assert processor.validate_sample() is True
    report = processor.generate_report()
    assert report["sample_id"] == unicode_id
    assert report["client_name"] == client


def test_unicode_metadata_keys_and_values():
    """Verify dictionary entry manipulation with internationalized strings."""
    processor = LaboratorySampleProcessor("SMP-1", "Test Corp")
    processor.set_metadata_entry("النوع", "مصل الدم")
    processor.set_metadata_entry("温度", "-80°C")
    
    assert processor.metadata["النوع"] == "مصل الدم"
    assert processor.metadata["温度"] == "-80°C"


# ============================================================================
# 3. UNIT TESTS: Extreme String Sizes & Boundary Conditions
# ============================================================================

def test_extremely_long_string_inputs():
    """Verify behavior with 1-million character strings."""
    long_id = "S" * 1_000_000
    long_client = "C" * 1_000_000

    processor = LaboratorySampleProcessor(
        sample_id=long_id,
        client_name=long_client,
        test_results=[1.0]
    )
    assert processor.validate_sample() is True
    assert len(processor.sample_id) == 1_000_000


def test_whitespace_and_empty_id_handling():
    """Ensure blank/whitespace-only IDs raise appropriate errors."""
    processor = LaboratorySampleProcessor(sample_id="   ", client_name="Valid Client")
    with pytest.raises(InvalidSampleError, match="Sample ID cannot be empty"):
        processor.validate_sample()


# ============================================================================
# 4. UNIT TESTS: Floating Point Infinities, NaN, and Large Datasets
# ============================================================================

def test_positive_and_negative_infinity_statistics():
    """Verify standard deviation and mean computations with Float Infinity."""
    processor = LaboratorySampleProcessor(
        sample_id="INF-001",
        client_name="Physics High Energy Lab",
        test_results=[1.0, float("inf"), 3.0]
    )
    stats = processor.calculate_statistics()
    assert math.isinf(stats["mean"])
    assert stats["min"] == 1.0
    assert stats["max"] == float("inf")
    assert math.isnan(stats["variance"])


def test_negative_infinity_handling():
    """Verify negative infinity handling."""
    processor = LaboratorySampleProcessor(
        sample_id="INF-002",
        client_name="Cryo Lab",
        test_results=[-float("inf"), float("inf")]
    )
    stats = processor.calculate_statistics()
    assert stats["min"] == -float("inf")
    assert stats["max"] == float("inf")


def test_nan_floating_point_rejection():
    """Verify NaN values trigger validation error."""
    processor = LaboratorySampleProcessor(
        sample_id="NAN-001",
        client_name="Quality Control",
        test_results=[10.0, float("nan"), 20.0]
    )
    with pytest.raises(InvalidSampleError, match="contains NaN"):
        processor.validate_sample()


def test_empty_test_results_statistics():
    """Verify statistical calculation failure on empty data vector."""
    processor = LaboratorySampleProcessor(sample_id="EMP-01", client_name="Empty Lab")
    with pytest.raises(InvalidSampleError, match="empty dataset"):
        processor.calculate_statistics()


# ============================================================================
# 5. UNIT TESTS: Status Transition Logic
# ============================================================================

def test_status_update_cases():
    """Verify case-insensitive status transitions."""
    processor = LaboratorySampleProcessor("ST-1", "Client")
    processor.update_status("in_analysis")
    assert processor.status == "IN_ANALYSIS"
    
    with pytest.raises(InvalidSampleError, match="Cannot transition status"):
        processor.update_status("INVALID_STATE")