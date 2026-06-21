"""
connectors/__init__.py
Platform connector registry.

To add a new platform:
    1. Create connectors/yourplatform.py
    2. Subclass BaseConnector, implement the 4 required methods
    3. Import and add to CONNECTOR_REGISTRY below
    4. main.py picks it up automatically

To enable/disable a platform at runtime:
    Set ENABLED_PLATFORMS in your .env file:
        ENABLED_PLATFORMS=internshala,linkedin,shine,ncs
"""

from .base        import BaseConnector, RawJob, WorkMode, RiskLevel
from .linkedin    import LinkedInConnector
from .internshala import InternshalaConnector
from .shine       import ShineConnector
from .ncs         import NCSConnector
from .naukri      import NaukriConnector
from .foundit     import FoundItConnector
from .career      import CareerConnector


CONNECTOR_REGISTRY: dict[str, type[BaseConnector]] = {
    "linkedin":    LinkedInConnector,
    "internshala": InternshalaConnector,
    "shine":       ShineConnector,
    "ncs":         NCSConnector,
    "naukri":      NaukriConnector,
    "foundit":     FoundItConnector,
    "career":      CareerConnector,
}

__all__ = [
    "BaseConnector",
    "RawJob",
    "WorkMode",
    "RiskLevel",
    "CONNECTOR_REGISTRY",
    "LinkedInConnector",
    "InternshalaConnector",
    "ShineConnector",
    "NCSConnector",
    "NaukriConnector",
    "FoundItConnector",
    "CareerConnector",
]