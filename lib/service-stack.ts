import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { CfnParametersCode, Code, Function, Runtime } from "aws-cdk-lib/lib/aws-lambda";
import { Construct } from "constructs";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

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
            functionName: `ServiceLambda${props.stageName}`
        });
        
        const httpApi = new HttpApi(this, 'ServiceApi', {
            defaultIntegration: new LambdaProxyIntegration({
                handler: lambda
            }),
            apiName: `MyService${props?.stageName}`
        });

        this.serviceEndpointOutput = new CfnOutput(this, 'ServiceEndpoint', {
            exportName: 'ServiceEndpoint',
            value: httpApi.apiEndpoint,
            description: 'ServiceEndpoint'
        })
    }
}
