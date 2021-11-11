import { Stack, StackProps } from "aws-cdk-lib";
import { CfnApi } from "aws-cdk-lib/lib/aws-apigatewayv2";
import { Code, Function, Runtime } from "aws-cdk-lib/lib/aws-lambda";
import { Construct } from "constructs";



export class ServiceStack extends Stack{
    public readonly serviceCode: Code;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.serviceCode = Code.fromCfnParameters();

        const lambda = new Function(this, 'ServiceLambda', {
            runtime: Runtime.NODEJS_14_X,
            handler: 'src/lambda.handler',
            code: this.serviceCode,
            functionName: 'ServiceLambda'
        })

        new CfnApi(this, 'ServiceApi', {
            protocolType: 'HTTP',
            name: 'ServiceApi',
            target: lambda.functionArn
        })
        // new HttpApi(this, 'ServiceApi', {
        //     defaultIntegration: new LambdaProxyIntegration({
        //         handler: lambda
        //     }),
        //     apiName: 'MyService'
        // })
    }
}
