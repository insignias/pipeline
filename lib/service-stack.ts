import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { CfnParametersCode, Code, Function, Runtime, Alias } from "aws-cdk-lib/lib/aws-lambda";
import { Construct } from "constructs";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { LambdaDeploymentConfig, LambdaDeploymentGroup } from "aws-cdk-lib/lib/aws-codedeploy";
import { Statistic, TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";

interface ServiceStackProps extends StackProps {
    stageName: string
}

export class ServiceStack extends Stack {
    public readonly serviceCode: CfnParametersCode;
    public readonly serviceEndpointOutput: CfnOutput;

    constructor(scope: Construct, id: string, props: ServiceStackProps) {
        super(scope, id, props);

        this.serviceCode = Code.fromCfnParameters();

        const lambda = new Function(this, 'ServiceLambda', {
            runtime: Runtime.NODEJS_14_X,
            handler: 'src/lambda.handler',
            code: this.serviceCode,
            functionName: `ServiceLambda${props.stageName}`,
            description: `Generated on ${new Date().toISOString()}`
        });

        const alias = new Alias(this, 'ServiceLambdaAlias', {
            version: lambda.currentVersion,
            aliasName: `ServiceLambdaAlias${props.stageName}`
        })
        
        const httpApi = new HttpApi(this, 'ServiceApi', {
            defaultIntegration: new LambdaProxyIntegration({
                handler: alias
            }),
            apiName: `MyService${props?.stageName}`
        });

        if (props.stageName === 'Prod'){
            new LambdaDeploymentGroup(this, 'DeploymentGroup', {
                deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
                alias: alias,
                autoRollback: {
                    deploymentInAlarm: true
                },
                alarms: [
                    httpApi
                        .metricServerError()
                        .with({
                            period: Duration.minutes(1),
                            statistic: Statistic.SUM
                        })
                        .createAlarm(this, 'ServerErrorAlarm', {
                            threshold: 1,
                            evaluationPeriods: 1,
                            alarmName: 'ServerErrorAlarm',
                            alarmDescription: 'Service is experiencing errors',
                            treatMissingData: TreatMissingData.NOT_BREACHING
                        })
                ]
            })
        }

        this.serviceEndpointOutput = new CfnOutput(this, 'ServiceEndpoint', {
            exportName: `ServiceEndpoint${props.stageName}`,
            value: httpApi.apiEndpoint,
            description: 'ServiceEndpoint'
        })
    }
}
