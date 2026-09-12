"""
Laboratory Information Management System (LIMS) Sample Management Module.

This module provides data structures and business logic for accepting, 
validating, calculating statistical metrics for, and reporting on biological 
and chemical test samples within a laboratory setting.

Compliance:
    PEP 8 -- Style Guide for Python Code
    PEP 287 -- reST docstrings
"""

import math
from datetime import datetime
from typing import Any, Dict, List, Optional, Union


class InvalidSampleError(Exception):
    """Raised when sample metadata or data points fail validation checks."""


class LaboratorySampleProcessor:
    """
    Processes, validates, and analyzes laboratory sample records.

    :ivar sample_id: Unique identifier for the laboratory sample.
    :type sample_id: str
    :ivar client_name: Name of the client or institution submitting the sample.
    :type client_name: str
    :ivar test_results: List of numerical analytical data points.
    :type test_results: List[float]
    :ivar metadata: Key-value attributes describing sample conditions.
    :type metadata: Dict[str, Any]
    :ivar status: Current workflow processing status of the sample.
    :type status: str
    """

    VALID_STATUSES = {"RECEIVED", "IN_ANALYSIS", "COMPLETED", "REJECTED"}

    def __init__(
        self,
        sample_id: str,
        client_name: str,
        test_results: Optional[List[float]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Initialize a LaboratorySampleProcessor instance.

        :param sample_id: Unique identifier for the sample.
        :type sample_id: str
        :param client_name: Submitting client or organization.
        :type client_name: str
        :param test_results: Initial array of float measurement values.
        :type test_results: Optional[List[float]]
        :param metadata: Custom metadata key-value mapping.
        :type metadata: Optional[Dict[str, Any]]
        """
        self.sample_id: str = str(sample_id) if sample_id is not None else ""
        self.client_name: str = str(client_name) if client_name is not None else ""
        self.test_results: List[float] = list(test_results) if test_results else []
        self.metadata: Dict[str, Any] = dict(metadata) if metadata else {}
        self.status: str = "RECEIVED"
        self.created_at: str = datetime.utcnow().isoformat()

    def validate_sample(self) -> bool:
        """
        Validate the structural and content integrity of the sample.

        Ensures non-empty identifiers, status adherence, and valid non-NaN 
        numerical values for measurements.

        :return: True if sample passes all operational integrity checks.
        :rtype: bool
        :raises InvalidSampleError: If any sample validation rule is violated.
        """
        if not self.sample_id or not self.sample_id.strip():
            raise InvalidSampleError("Sample ID cannot be empty or whitespace.")

        if not self.client_name:
            raise InvalidSampleError("Client name field must be specified.")

        if self.status not in self.VALID_STATUSES:
            raise InvalidSampleError(f"Invalid status value: '{self.status}'.")

        for index, value in enumerate(self.test_results):
            if not isinstance(value, (int, float)):
                raise InvalidSampleError(
                    f"Result at index {index} is not numeric."
                )
            if math.isnan(value):
                raise InvalidSampleError(
                    f"Result at index {index} contains NaN."
                )

        return True

    def calculate_statistics(self) -> Dict[str, float]:
        """
        Calculate summary statistics for laboratory test results.

        Computes mean, variance, standard deviation, min, and max while 
        handling special float values like infinity.

        :return: Dictionary containing statistical metrics: mean, std_dev, 
                 variance, min, max, count.
        :rtype: Dict[str, float]
        :raises InvalidSampleError: If test results list is empty.
        """
        self.validate_sample()

        if not self.test_results:
            raise InvalidSampleError("Cannot calculate stats on empty dataset.")

        count: int = len(self.test_results)
        total_sum: float = sum(self.test_results)
        mean: float = total_sum / count

        # Check for dynamic infinity presence in sum operations
        if math.isinf(mean):
            return {
                "mean": mean,
                "variance": float("nan"),
                "std_dev": float("nan"),
                "min": min(self.test_results),
                "max": max(self.test_results),
                "count": float(count),
            }

        variance_sum: float = sum(
            (x - mean) ** 2 for x in self.test_results
        )
        variance: float = variance_sum / count
        std_dev: float = math.sqrt(variance)

        return {
            "mean": mean,
            "variance": variance,
            "std_dev": std_dev,
            "min": min(self.test_results),
            "max": max(self.test_results),
            "count": float(count),
        }

    def update_status(self, new_status: str) -> None:
        """
        Transition the sample workflow to a new processing status.

        :param new_status: Target status identifier.
        :type new_status: str
        :raises InvalidSampleError: If target status is unknown or invalid.
        """
        normalized_status = str(new_status).upper().strip()
        if normalized_status not in self.VALID_STATUSES:
            raise InvalidSampleError(
                f"Cannot transition status to '{new_status}'."
            )
        self.status = normalized_status

    def set_metadata_entry(self, key: Any, value: Any) -> None:
        """
        Set or update a key-value entry in sample metadata.

        Converts keys to strings to ensure dictionary key sanity.

        :param key: Attribute lookup key.
        :type key: Any
        :param value: Attribute value payload.
        :type value: Any
        """
        str_key = str(key)
        self.metadata[str_key] = value

    def generate_report(self) -> Dict[str, Any]:
        """
        Generate a comprehensive lab sample report object.

        :return: Complete lab sample details including calculated statistics.
        :rtype: Dict[str, Any]
        """
        self.validate_sample()
        stats: Optional[Dict[str, float]] = None
        if self.test_results:
            stats = self.calculate_statistics()

        return {
            "sample_id": self.sample_id,
            "client_name": self.client_name,
            "status": self.status,
            "created_at": self.created_at,
            "metadata": self.metadata,
            "statistics": stats,
            "result_count": len(self.test_results),
        }
