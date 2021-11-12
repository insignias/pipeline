import { CfnParameter, Stack, StackProps } from "aws-cdk-lib";
import { CfnApi, CfnIntegration, HttpApi } from "aws-cdk-lib/lib/aws-apigatewayv2";
import { LambdaProxyIntegration } from "aws-cdk-lib/lib/aws-apigatewayv2-integrations";
import { CfnParametersCode, CfnPermission, Code, Function, Runtime } from "aws-cdk-lib/lib/aws-lambda";
import { Construct } from "constructs";

export class ServiceStack extends Stack {
    public readonly serviceCode: CfnParametersCode;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.serviceCode = Code.fromCfnParameters();

        const lambda = new Function(this, 'ServiceLambda', {
            runtime: Runtime.NODEJS_14_X,
            handler: 'src/lambda.handler',
            code: this.serviceCode,
            functionName: 'ServiceLambda'
        })

        // const api = new CfnApi(this, 'ServiceApi', {
        //     protocolType: 'HTTP',
        //     name: 'ServiceApi',
        //     target: lambda.functionArn
        // });

        // const permission = new CfnPermission(this, 'lambdaPermission', {
        //     functionName: lambda.functionArn,
        //     action: 'lambda:InvokeFunction',
        //     principal: 'apigateway.amazonaws.com',
        //     sourceArn: api.
        // })

        
        new HttpApi(this, 'ServiceApi', {
            defaultIntegration: new LambdaProxyIntegration({
                handler: lambda
            }),
            apiName: 'MyService'
        })
    }
}
