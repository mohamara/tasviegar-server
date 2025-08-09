# 🚀 Deployment & DevOps - Settler App

## Overview
Settler uses **modern DevOps practices** with **Infrastructure as Code**, **automated CI/CD pipelines**, and **comprehensive monitoring** for reliable, scalable deployment.

## 🏗️ Infrastructure Architecture

### 1. **Production Environment**
```yaml
# infrastructure/production/main.tf
# AWS Infrastructure using Terraform

# VPC Configuration
resource "aws_vpc" "settler_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "settler-production-vpc"
    Environment = "production"
  }
}

# Application Load Balancer
resource "aws_lb" "app_lb" {
  name               = "settler-app-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets           = aws_subnet.public[*].id

  enable_deletion_protection = true
}

# ECS Cluster for Backend
resource "aws_ecs_cluster" "main" {
  name = "settler-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "settler-postgres"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.large"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = "settler_production"
  username = var.db_username
  password = var.db_password
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  multi_az               = true
  publicly_accessible    = false
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "settler-redis"
  description                = "Redis cluster for Settler app"
  
  node_type                  = "cache.r6g.large"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]
}
```

### 2. **Container Configuration**
```dockerfile
# Dockerfile.backend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### 3. **Kubernetes Manifests**
```yaml
# k8s/production/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: settler-backend
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: settler-backend
  template:
    metadata:
      labels:
        app: settler-backend
    spec:
      containers:
      - name: backend
        image: settler/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: settler-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: settler-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
```

## 🔄 CI/CD Pipeline

### 1. **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: settler_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run linting
      run: |
        cd backend
        npm run lint
    
    - name: Run type checking
      run: |
        cd backend
        npm run type-check
    
    - name: Run unit tests
      run: |
        cd backend
        npm run test:unit
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/settler_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: |
        cd backend
        npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/settler_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: |
        cd backend
        npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/settler_test
        REDIS_URL: redis://localhost:6379

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run security audit
      run: |
        cd backend
        npm audit --audit-level=moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    - name: Run CodeQL analysis
      uses: github/codeql-action/analyze@v2

  build-and-deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Staging deployment steps
    
    - name: Run smoke tests
      run: |
        echo "Running smoke tests against staging"
        # Smoke test implementation
    
    - name: Deploy to production
      if: success()
      run: |
        echo "Deploying to production environment"
        # Production deployment steps
```

### 2. **Database Migrations**
```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Check database connectivity
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Run Prisma migrations
    await execAsync('npx prisma migrate deploy');
    console.log('✅ Migrations completed');
    
    // Seed production data if needed
    if (process.env.SEED_PRODUCTION === 'true') {
      await execAsync('npx prisma db seed');
      console.log('✅ Database seeded');
    }
    
    // Validate schema
    await execAsync('npx prisma validate');
    console.log('✅ Schema validated');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
```

## 📊 Monitoring & Observability

### 1. **Application Monitoring**
```typescript
// monitoring/prometheus.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users'
});

export const debtOperations = new Counter({
  name: 'debt_operations_total',
  help: 'Total number of debt operations',
  labelNames: ['operation', 'status']
});

export const settlementValue = new Histogram({
  name: 'settlement_value_usd',
  help: 'Value of settlements in USD',
  buckets: [1, 10, 50, 100, 500, 1000, 5000, 10000]
});

// Middleware for metrics collection
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
}
```

### 2. **Logging Configuration**
```typescript
// logging/winston.config.ts
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const esTransport = new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL,
    auth: {
      username: process.env.ELASTICSEARCH_USER,
      password: process.env.ELASTICSEARCH_PASS
    }
  },
  index: 'settler-logs'
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'settler-backend',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(esTransport);
} else {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Structured logging helpers
export const loggers = {
  auth: logger.child({ module: 'auth' }),
  debt: logger.child({ module: 'debt' }),
  settlement: logger.child({ module: 'settlement' }),
  security: logger.child({ module: 'security' })
};
```

### 3. **Health Checks**
```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION
    };
  }

  @Get('ready')
  async readiness(): Promise<ReadinessStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices()
    ]);

    const allHealthy = checks.every(check => check.status === 'fulfilled');

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      checks: {
        database: checks[0].status === 'fulfilled',
        redis: checks[1].status === 'fulfilled',
        external: checks[2].status === 'fulfilled'
      },
      timestamp: new Date().toISOString()
    };
  }

  private async checkDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    await this.redis.ping();
  }

  private async checkExternalServices(): Promise<void> {
    // Check critical external dependencies
    const checks = [
      fetch(`${process.env.PAYMENT_SERVICE_URL}/health`),
      fetch(`${process.env.EMAIL_SERVICE_URL}/health`)
    ];

    await Promise.all(checks);
  }
}
```

## 📈 Performance Optimization

### 1. **Caching Strategy**
```typescript
// caching/cache.service.ts
@Injectable()
export class CacheService {
  constructor(private redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Cache decorators
  @CacheResult('user:profile', 300) // 5 minutes
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.userRepository.findById(userId);
  }

  @CacheInvalidate(['user:profile:*', 'user:debts:*'])
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    return this.userRepository.update(userId, updates);
  }
}
```

### 2. **Database Optimization**
```sql
-- Database performance optimizations

-- Efficient indexes for common queries
CREATE INDEX CONCURRENTLY idx_debts_user_status 
ON debts(creditor_id, debtor_id, status) 
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_debts_due_date 
ON debts(due_date) 
WHERE status = 'pending' AND deleted_at IS NULL;

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_notifications_unread 
ON notifications(user_id, created_at) 
WHERE is_read = false;

-- Query optimization
EXPLAIN (ANALYZE, BUFFERS) 
SELECT d.*, u1.first_name as creditor_name, u2.first_name as debtor_name
FROM debts d
JOIN users u1 ON d.creditor_id = u1.id
JOIN users u2 ON d.debtor_id = u2.id
WHERE (d.creditor_id = $1 OR d.debtor_id = $1)
  AND d.status = 'pending'
  AND d.deleted_at IS NULL
ORDER BY d.created_at DESC;
```

## 🔧 Environment Management

### 1. **Environment Configuration**
```typescript
// config/environment.ts
export const config = {
  development: {
    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/settler_dev',
      ssl: false,
      logging: true
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retryAttempts: 3
    },
    auth: {
      jwtSecret: 'dev-secret',
      jwtExpiration: '15m',
      refreshExpiration: '7d'
    }
  },
  
  staging: {
    database: {
      url: process.env.DATABASE_URL,
      ssl: true,
      logging: false
    },
    redis: {
      url: process.env.REDIS_URL,
      retryAttempts: 5
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiration: '15m',
      refreshExpiration: '7d'
    }
  },
  
  production: {
    database: {
      url: process.env.DATABASE_URL,
      ssl: true,
      logging: false,
      pool: {
        min: 2,
        max: 10
      }
    },
    redis: {
      url: process.env.REDIS_URL,
      retryAttempts: 10,
      cluster: true
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiration: '15m',
      refreshExpiration: '7d'
    }
  }
};
```

### 2. **Secrets Management**
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: settler-secrets
  namespace: production
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  redis-url: <base64-encoded-redis-url>
  jwt-secret: <base64-encoded-jwt-secret>
  encryption-key: <base64-encoded-encryption-key>
  payment-api-key: <base64-encoded-payment-key>
```

## 🚨 Disaster Recovery

### 1. **Backup Strategy**
```bash
#!/bin/bash
# scripts/backup.sh

# Database backup
pg_dump $DATABASE_URL | gzip > /backups/settler_$(date +%Y%m%d_%H%M%S).sql.gz

# Upload to S3
aws s3 cp /backups/settler_$(date +%Y%m%d_%H%M%S).sql.gz s3://settler-backups/daily/

# Redis backup
redis-cli --rdb /backups/redis_$(date +%Y%m%d_%H%M%S).rdb
aws s3 cp /backups/redis_$(date +%Y%m%d_%H%M%S).rdb s3://settler-backups/redis/

# Cleanup old local backups (keep last 7 days)
find /backups -name "*.sql.gz" -mtime +7 -delete
find /backups -name "*.rdb" -mtime +7 -delete
```

### 2. **Recovery Procedures**
```bash
#!/bin/bash
# scripts/restore.sh

# Download latest backup
aws s3 cp s3://settler-backups/daily/latest.sql.gz /tmp/restore.sql.gz

# Restore database
gunzip -c /tmp/restore.sql.gz | psql $DATABASE_URL

# Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## 🤖 AI Implementation Prompt

```
You are tasked with implementing Settler app deployment and DevOps. Use these guidelines:

1. **Infrastructure as Code**:
   - Use Terraform for AWS infrastructure
   - Implement proper VPC, security groups, and networking
   - Create RDS with Multi-AZ and encryption
   - Set up ElastiCache Redis cluster

2. **Container Orchestration**:
   - Create optimized Dockerfiles with multi-stage builds
   - Implement Kubernetes manifests with proper resource limits
   - Add health checks and readiness probes
   - Configure horizontal pod autoscaling

3. **CI/CD Pipeline**:
   - Build comprehensive GitHub Actions workflows
   - Add automated testing at all levels
   - Implement security scanning and vulnerability checks
   - Create staging and production deployment stages

4. **Monitoring & Observability**:
   - Set up Prometheus metrics collection
   - Implement structured logging with ELK stack
   - Create comprehensive health check endpoints
   - Add application performance monitoring

5. **Security & Compliance**:
   - Implement secrets management with Kubernetes secrets
   - Add network security with proper firewall rules
   - Create audit logging for compliance
   - Implement automated backup procedures

6. **Performance Optimization**:
   - Set up Redis caching with proper invalidation
   - Optimize database queries and indexes
   - Implement CDN for static assets
   - Add load balancing with health checks

7. **Disaster Recovery**:
   - Create automated backup procedures
   - Implement point-in-time recovery
   - Add cross-region disaster recovery
   - Create runbooks for incident response

Generate production-ready DevOps implementation following these specifications exactly.
``` 