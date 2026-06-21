"""
inverse_scraper/connectors/__init__.py
Inverse platform connector registry.
"""

from .base import BaseInverseConnector, RawScamJob
from .complaint_board import ComplaintBoardConnector
from .consumer_complaints import ConsumerComplaintsConnector

INVERSE_CONNECTOR_REGISTRY: dict[str, type[BaseInverseConnector]] = {
    "complaintboard": ComplaintBoardConnector,
    "consumercomplaints": ConsumerComplaintsConnector,
}

__all__ = [
    "BaseInverseConnector",
    "RawScamJob",
    "INVERSE_CONNECTOR_REGISTRY",
    "ComplaintBoardConnector",
    "ConsumerComplaintsConnector",
]
