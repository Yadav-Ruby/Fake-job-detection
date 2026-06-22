"""
inverse_scraper/connectors/base.py
Base contract for the inverse scraper platform connectors.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class RawScamJob:
    """Loose container for scraped scam data."""
    source_url:      str
    platform_name:   str
    job_title:       str = ""
    job_description: str = ""
    salary_raw:      str = ""
    skills:          list[str] = field(default_factory=list)
    is_scam:         bool = True

class BaseInverseConnector(ABC):
    """Abstract base for all inverse platform scrapers targeting scam sources."""

    def __init__(self, config: dict):
        self.config = config
        self.jobs_per_query = int(config.get("JOBS_PER_QUERY", 10))

    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Name of the source of scam data."""
        pass

    @abstractmethod
    def search_urls(self, keywords: list[str]) -> list[str]:
        """Build search or page URLs targeting scam listings."""
        pass

    @abstractmethod
    def extract_scam_links(self, html: str) -> list[str]:
        """Extract links to scam posts from a listing page."""
        pass

    @abstractmethod
    def extract_scam_data(self, html: str, url: str) -> Optional[RawScamJob]:
        """Extract RawScamJob from the details page."""
        pass
