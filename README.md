# Enterprise Loan Management SPA
## Prerequisites
- Docker Desktop 4.x+
- Docker Compose v2+
- (No Node, Java, or Maven needed locally — Docker handles everything)

## Quick Start
git clone <repo>
cd loan-management
cp .env.example .env
docker-compose up --build
# first build takes ~3-5 mins

## Access
| Service | URL |
| --- | --- |
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080/api/v1 |
| Database | localhost:5432 (loandb) |

## Rebuild after code changes
docker-compose up --build --force-recreate

## Stop
docker-compose down

## Wipe database and start fresh
docker-compose down -v
docker-compose up --build

