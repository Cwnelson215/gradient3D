"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceArn = exports.serviceName = exports.ecrRepositoryUrl = exports.albUrl = exports.appUrl = void 0;
const pulumi = __importStar(require("@pulumi/pulumi"));
const aws = __importStar(require("@pulumi/aws"));
// =============================================================================
// Configuration
// =============================================================================
const config = new pulumi.Config();
const appName = config.require("appName");
const subdomain = config.require("subdomain");
const platformStackName = config.require("platformStack");
const cpu = parseInt(config.get("cpu") || "256");
const memory = parseInt(config.get("memory") || "512");
const desiredCount = parseInt(config.get("desiredCount") || "1");
const containerPort = parseInt(config.get("containerPort") || "3000");
const useFargateSpot = config.getBoolean("useFargateSpot") ?? true;
// Scheduled scaling (optional)
const enableScheduledScaling = config.getBoolean("enableScheduledScaling") ?? false;
const scaleUpHour = parseInt(config.get("scaleUpHour") || "6"); // 6 AM
const scaleDownHour = parseInt(config.get("scaleDownHour") || "22"); // 10 PM
const scheduleTimezone = config.get("scheduleTimezone") || "America/Denver";
// =============================================================================
// Import Platform Stack Outputs
// =============================================================================
const platformStack = new pulumi.StackReference(platformStackName);
const vpcId = platformStack.getOutput("vpcId");
const publicSubnetIds = platformStack.getOutput("publicSubnetIds");
const defaultSecurityGroupId = platformStack.getOutput("defaultSecurityGroupId");
const clusterArn = platformStack.getOutput("clusterArn");
const clusterName = platformStack.getOutput("clusterName");
const taskExecutionRoleArn = platformStack.getOutput("taskExecutionRoleArn");
const taskRoleArn = platformStack.getOutput("taskRoleArn");
const httpsListenerArn = platformStack.getOutput("httpsListenerArn");
const albSecurityGroupId = platformStack.getOutput("albSecurityGroupId");
const albDnsName = platformStack.getOutput("albDnsName");
const domainName = platformStack.getOutput("domainName");
const logGroupName = platformStack.getOutput("logGroupName");
const region = platformStack.getOutput("region");
// =============================================================================
// Tags
// =============================================================================
const tags = {
    Project: "portfolio",
    App: appName,
    ManagedBy: "pulumi",
};
// =============================================================================
// ECR Repository for this app
// =============================================================================
const ecrRepo = new aws.ecr.Repository(`${appName}-repo`, {
    name: `portfolio/${appName}`,
    imageTagMutability: "MUTABLE",
    imageScanningConfiguration: {
        scanOnPush: true,
    },
    tags,
});
new aws.ecr.LifecyclePolicy(`${appName}-lifecycle`, {
    repository: ecrRepo.name,
    policy: JSON.stringify({
        rules: [
            {
                rulePriority: 1,
                description: "Keep last 10 images",
                selection: {
                    tagStatus: "any",
                    countType: "imageCountMoreThan",
                    countNumber: 10,
                },
                action: {
                    type: "expire",
                },
            },
        ],
    }),
});
// =============================================================================
// Security Group for the app
// =============================================================================
const appSg = new aws.ec2.SecurityGroup(`${appName}-sg`, {
    vpcId,
    description: `Security group for ${appName}`,
    ingress: [
        {
            protocol: "tcp",
            fromPort: containerPort,
            toPort: containerPort,
            securityGroups: [albSecurityGroupId],
            description: "Allow traffic from ALB",
        },
    ],
    egress: [
        {
            protocol: "-1",
            fromPort: 0,
            toPort: 0,
            cidrBlocks: ["0.0.0.0/0"],
        },
    ],
    tags: { ...tags, Name: `${appName}-sg` },
});
// =============================================================================
// Target Group
// =============================================================================
const targetGroup = new aws.lb.TargetGroup(`${appName}-tg`, {
    port: containerPort,
    protocol: "HTTP",
    vpcId,
    targetType: "ip",
    healthCheck: {
        enabled: true,
        path: "/health",
        healthyThreshold: 2,
        unhealthyThreshold: 3,
        timeout: 5,
        interval: 30,
        matcher: "200",
    },
    deregistrationDelay: 30,
    tags,
});
// =============================================================================
// ALB Listener Rule (host-based routing on HTTPS)
// =============================================================================
const fullHostname = pulumi.interpolate `${subdomain}.${domainName}`;
const listenerRule = new aws.lb.ListenerRule(`${appName}-rule`, {
    listenerArn: httpsListenerArn,
    priority: pulumi.output(subdomain).apply((s) => {
        // Generate a consistent priority from subdomain name
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash % 49000) + 1000; // Range 1000-50000
    }),
    conditions: [
        {
            hostHeader: {
                values: [fullHostname],
            },
        },
    ],
    actions: [
        {
            type: "forward",
            targetGroupArn: targetGroup.arn,
        },
    ],
    tags,
});
// =============================================================================
// ECS Task Definition
// =============================================================================
// Build environment variables
const containerEnv = [
    { name: "NODE_ENV", value: "production" },
    { name: "PORT", value: containerPort.toString() },
];
// Task definition
const taskDefinition = new aws.ecs.TaskDefinition(`${appName}-task`, {
    family: appName,
    cpu: cpu.toString(),
    memory: memory.toString(),
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: taskExecutionRoleArn,
    taskRoleArn: taskRoleArn,
    containerDefinitions: pulumi
        .all([ecrRepo.repositoryUrl, logGroupName, region])
        .apply(([repoUrl, logGroup, awsRegion]) => {
        const env = [...containerEnv];
        return JSON.stringify([
            {
                name: appName,
                image: `${repoUrl}:latest`,
                essential: true,
                portMappings: [
                    {
                        containerPort: containerPort,
                        protocol: "tcp",
                    },
                ],
                environment: env,
                logConfiguration: {
                    logDriver: "awslogs",
                    options: {
                        "awslogs-group": logGroup,
                        "awslogs-region": awsRegion,
                        "awslogs-stream-prefix": appName,
                    },
                },
                healthCheck: {
                    command: ["CMD-SHELL", `curl -f http://localhost:${containerPort}/health || exit 1`],
                    interval: 30,
                    timeout: 5,
                    retries: 3,
                    startPeriod: 60,
                },
            },
        ]);
    }),
    tags,
});
// =============================================================================
// ECS Service
// =============================================================================
const service = new aws.ecs.Service(`${appName}-service`, {
    name: appName,
    cluster: clusterArn,
    taskDefinition: taskDefinition.arn,
    desiredCount: desiredCount,
    capacityProviderStrategies: [
        {
            capacityProvider: "FARGATE_SPOT",
            weight: 1,
            base: 1,
        },
    ],
    networkConfiguration: {
        subnets: publicSubnetIds,
        securityGroups: [appSg.id, defaultSecurityGroupId],
        assignPublicIp: true,
    },
    loadBalancers: [
        {
            targetGroupArn: targetGroup.arn,
            containerName: appName,
            containerPort: containerPort,
        },
    ],
    deploymentMinimumHealthyPercent: 50,
    deploymentMaximumPercent: 200,
    propagateTags: "SERVICE",
    healthCheckGracePeriodSeconds: 60,
    tags,
});
// =============================================================================
// Scheduled Scaling
// =============================================================================
if (enableScheduledScaling) {
    // Auto Scaling target
    const scalingTarget = new aws.appautoscaling.Target(`${appName}-scaling-target`, {
        maxCapacity: desiredCount,
        minCapacity: 0,
        resourceId: pulumi.interpolate `service/${clusterArn.apply(arn => arn.split('/').pop())}/${service.name}`,
        scalableDimension: "ecs:service:DesiredCount",
        serviceNamespace: "ecs",
    });
    // Scale up in the morning
    new aws.appautoscaling.ScheduledAction(`${appName}-scale-up`, {
        name: `${appName}-scale-up`,
        serviceNamespace: scalingTarget.serviceNamespace,
        resourceId: scalingTarget.resourceId,
        scalableDimension: scalingTarget.scalableDimension,
        schedule: `cron(0 ${scaleUpHour} * * ? *)`,
        timezone: scheduleTimezone,
        scalableTargetAction: {
            minCapacity: desiredCount,
            maxCapacity: desiredCount,
        },
    });
    // Scale down at night
    new aws.appautoscaling.ScheduledAction(`${appName}-scale-down`, {
        name: `${appName}-scale-down`,
        serviceNamespace: scalingTarget.serviceNamespace,
        resourceId: scalingTarget.resourceId,
        scalableDimension: scalingTarget.scalableDimension,
        schedule: `cron(0 ${scaleDownHour} * * ? *)`,
        timezone: scheduleTimezone,
        scalableTargetAction: {
            minCapacity: 0,
            maxCapacity: 0,
        },
    });
}
// =============================================================================
// Outputs
// =============================================================================
exports.appUrl = pulumi.interpolate `https://${subdomain}.${domainName}`;
exports.albUrl = pulumi.interpolate `http://${albDnsName}`;
exports.ecrRepositoryUrl = ecrRepo.repositoryUrl;
exports.serviceName = service.name;
exports.serviceArn = service.id;
