#!/bin/bash
# Production deployment script for backend

set -e

echo "🚀 Backend Deployment Script"
echo "=============================="

# Configuration
CONTAINER_NAME="bcode-backend"
IMAGE_NAME="bcode-ecom"
IMAGE_TAG="latest"
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_env() {
    if [ ! -f ".env" ]; then
        log_error ".env file not found!"
        log_info "Creating .env from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warn "Please edit .env file with your actual values"
            exit 1
        else
            log_error ".env.example not found either!"
            exit 1
        fi
    fi
    log_info ".env file found ✓"
}

backup_current() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Backing up current container..."
        docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:${BACKUP_TAG} || true
        log_info "Backup created: ${IMAGE_NAME}:${BACKUP_TAG}"
    fi
}

stop_current() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Stopping current container..."
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
        log_info "Container stopped and removed ✓"
    fi
}

build_image() {
    log_info "Building Docker image..."
    
    # Load DATABASE_URL from .env for build arg
    export $(grep -v '^#' .env | xargs)
    
    docker build \
        --build-arg DATABASE_URL="${DATABASE_URL}" \
        --tag ${IMAGE_NAME}:${IMAGE_TAG} \
        --progress=plain \
        . || {
            log_error "Docker build failed!"
            exit 1
        }
    
    log_info "Image built successfully ✓"
}

run_container() {
    log_info "Starting new container..."
    
    docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        -p 3001:3001 \
        --env-file .env \
        -v "$(pwd)/uploads:/app/uploads" \
        ${IMAGE_NAME}:${IMAGE_TAG} || {
            log_error "Failed to start container!"
            log_info "Attempting rollback..."
            rollback
            exit 1
        }
    
    log_info "Container started ✓"
}

reset_database() {
    log_warn "Resetting database (this will delete all data)..."
    
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Running database reset in container..."
        docker exec ${CONTAINER_NAME} npx prisma migrate reset --force --skip-generate || {
            log_error "Database reset failed!"
            return 1
        }
        log_info "Database reset completed ✓"
    else
        log_error "Container not running!"
        return 1
    fi
}

wait_for_health() {
    log_info "Waiting for application to be healthy..."
    
    for i in {1..30}; do
        if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
                log_info "Application is healthy ✓"
                return 0
            fi
        else
            log_error "Container stopped unexpectedly!"
            docker logs --tail 50 ${CONTAINER_NAME}
            return 1
        fi
        
        echo -n "."
        sleep 2
    done
    
    log_error "Health check timeout!"
    log_info "Container logs:"
    docker logs --tail 50 ${CONTAINER_NAME}
    return 1
}

rollback() {
    log_warn "Rolling back to previous version..."
    
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    
    if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "${IMAGE_NAME}:${BACKUP_TAG}"; then
        docker run -d \
            --name ${CONTAINER_NAME} \
            --restart unless-stopped \
            -p 3001:3001 \
            --env-file .env \
            -v "$(pwd)/uploads:/app/uploads" \
            ${IMAGE_NAME}:${BACKUP_TAG}
        
        log_info "Rollback completed ✓"
    else
        log_error "No backup found to rollback to!"
    fi
}

cleanup() {
    log_info "Cleaning up old images..."
    docker image prune -f
    log_info "Cleanup completed ✓"
}

show_status() {
    echo ""
    echo "=============================="
    log_info "Deployment Status:"
    echo "=============================="
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    log_info "View logs with: docker logs -f ${CONTAINER_NAME}"
    log_info "Health check: curl http://localhost:3001/api/health"
    echo ""
}

# Main deployment flow
main() {
    log_info "Starting deployment..."
    
    check_env
    backup_current
    stop_current
    build_image
    run_container
    reset_database
    
    if wait_for_health; then
        cleanup
        show_status
        log_info "Deployment successful! 🎉"
        exit 0
    else
        log_error "Deployment failed!"
        rollback
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    reset-db)
        reset_database
        ;;
    rollback)
        rollback
        ;;
    logs)
        docker logs -f ${CONTAINER_NAME}
        ;;
    restart)
        docker restart ${CONTAINER_NAME}
        ;;
    stop)
        docker stop ${CONTAINER_NAME}
        ;;
    start)
        docker start ${CONTAINER_NAME}
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {deploy|reset-db|rollback|logs|restart|stop|start|status}"
        exit 1
        ;;
esac
