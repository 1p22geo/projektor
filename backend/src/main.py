from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
import os
import logging

# Load environment variables from the project root .env.local file
load_dotenv(find_dotenv(".env.local", usecwd=True))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:8080",  # Frontend development server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def validation_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "Internal server error"},
    )


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# Include routers here as they are created
from api import users, teams, competitions, auth, admin, headteacher, student
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(headteacher.router, prefix="/api/headteacher", tags=["headteacher"])
app.include_router(student.router, prefix="/api/student", tags=["student"])
app.include_router(competitions.router, prefix="/api/competitions", tags=["competitions"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
