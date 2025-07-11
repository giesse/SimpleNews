from typing import Dict, Set
from . import schemas

# In-memory store for job statuses and cancellations
job_statuses: Dict[str, schemas.JobStatus] = {}
canceled_jobs: Set[str] = set()
