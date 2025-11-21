from fastapi import FastAPI, Request, status, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
import os
import logging
from typing import Dict, List

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
from api import (
    users,
    teams,
    competitions,
    auth,
    admin,
    headteacher,
    student,
    join_requests,
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(headteacher.router, prefix="/api/headteacher", tags=["headteacher"])
app.include_router(student.router, prefix="/api/student", tags=["student"])
app.include_router(
    competitions.router, prefix="/api/competitions", tags=["competitions"]
)
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(
    join_requests.router, prefix="/api/join-requests", tags=["join_requests"]
)


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, team_id: str):
        await websocket.accept()
        if team_id not in self.active_connections:
            self.active_connections[team_id] = []
        self.active_connections[team_id].append(websocket)

    def disconnect(self, websocket: WebSocket, team_id: str):
        if team_id in self.active_connections:
            self.active_connections[team_id].remove(websocket)
            if not self.active_connections[team_id]:
                del self.active_connections[team_id]

    async def broadcast(self, team_id: str, message: dict):
        if team_id in self.active_connections:
            for connection in self.active_connections[team_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass


manager = ConnectionManager()


@app.websocket("/ws/teams/{team_id}")
async def websocket_endpoint(websocket: WebSocket, team_id: str):
    await manager.connect(websocket, team_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast message to all connected clients in this team
            await manager.broadcast(team_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, team_id)
