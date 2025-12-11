"""FastAPI main application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import events, metrics

app = FastAPI(
    title="AI LOC Tracker API",
    description="Backend API for tracking AI-augmented engineering metrics and Lines of Code (LOC)",
    version="0.1.0",
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router)
app.include_router(metrics.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI LOC Tracker API",
        "version": "0.1.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

