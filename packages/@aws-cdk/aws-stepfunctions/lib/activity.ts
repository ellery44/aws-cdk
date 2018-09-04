import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import cdk = require('@aws-cdk/cdk');
import { IStepFunctionsTaskResource, StepFunctionsTaskResourceProps, Task } from './states/task';
import { ActivityArn, ActivityName, cloudformation } from './stepfunctions.generated';

export interface ActivityProps {
    /**
     * The name for this activity.
     *
     * @default If not supplied, a name is generated
     */
    activityName?: string;
}

/**
 * Define a new StepFunctions activity
 */
export class Activity extends cdk.Construct implements IStepFunctionsTaskResource {
    public readonly activityArn: ActivityArn;
    public readonly activityName: ActivityName;

    constructor(parent: cdk.Construct, id: string, props: ActivityProps = {}) {
        super(parent, id);

        const resource = new cloudformation.ActivityResource(this, 'Resource', {
            activityName: props.activityName || this.uniqueId
        });

        this.activityArn = resource.ref;
        this.activityName = resource.activityName;
    }

    public asStepFunctionsTaskResource(_callingTask: Task): StepFunctionsTaskResourceProps {
        // No IAM permissions necessary, execution role implicitly has Activity permissions.
        return {
            resourceArn: this.activityArn,
            metricPrefixSingular: 'Activity',
            metricPrefixPlural: 'Activities',
            metricDimensions: { ActivityArn: this.activityArn },
        };
    }

    /**
     * Return the given named metric for this Activity
     *
     * @default sum over 5 minutes
     */
    public metric(metricName: string, props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return new cloudwatch.Metric({
            namespace: 'AWS/States',
            metricName,
            dimensions: { ActivityArn: this.activityArn },
            statistic: 'sum',
            ...props
        });
    }

    /**
     * The interval, in milliseconds, between the time the activity starts and the time it closes.
     *
     * @default average over 5 minutes
     */
    public metricRunTime(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivityRunTime', { statistic: 'avg', ...props });
    }

    /**
     * The interval, in milliseconds, for which the activity stays in the schedule state.
     *
     * @default average over 5 minutes
     */
    public metricScheduleTime(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivityScheduleTime', { statistic: 'avg', ...props });
    }

    /**
     * The interval, in milliseconds, between the time the activity is scheduled and the time it closes.
     *
     * @default average over 5 minutes
     */
    public metricTime(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivityTime', { statistic: 'avg', ...props });
    }

    /**
     * Metric for the number of times this activity is scheduled
     *
     * @default sum over 5 minutes
     */
    public metricScheduled(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivitiesScheduled', props);
    }

    /**
     * Metric for the number of times this activity times out
     *
     * @default sum over 5 minutes
     */
    public metricTimedOut(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivitiesTimedOut', props);
    }

    /**
     * Metric for the number of times this activity is started
     *
     * @default sum over 5 minutes
     */
    public metricStarted(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivitiesStarted', props);
    }

    /**
     * Metric for the number of times this activity succeeds
     *
     * @default sum over 5 minutes
     */
    public metricSucceeded(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivitiesSucceeded', props);
    }

    /**
     * Metric for the number of times this activity fails
     *
     * @default sum over 5 minutes
     */
    public metricFailed(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivitiesFailed', props);
    }

    /**
     * Metric for the number of times the heartbeat times out for this activity
     *
     * @default sum over 5 minutes
     */
    public metricHeartbeatTimedOut(props?: cloudwatch.MetricCustomization): cloudwatch.Metric {
        return this.metric('ActivitiesHeartbeatTimedOut', props);
    }
}