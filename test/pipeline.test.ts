import * as cdk from 'aws-cdk-lib';
import * as Pipeline from '../lib/pipeline-stack';
import { arrayWith, expect as expectCDK, haveResourceLike, objectLike, SynthUtils} from '@aws-cdk/assert';
import { App } from 'aws-cdk-lib';
import { ServiceStack } from '../lib/service-stack';
import { WSAEHOSTDOWN } from 'constants';
import { BillingStack } from '../lib/billing-stack';

test('PipelineStack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Pipeline.PipelineStack(app, 'PipelineStack');
    // THEN
    expect(SynthUtils.toCloudFormation).toMatchSnapshot();
});

test('Adding New Stage', () => {
    //GIVEN
    const app = new App();
    const ServiceTestStack = new ServiceStack(app, 'ServiceTestStack', {stageName: 'dummy'});
    const PipelineTestStack = new Pipeline.PipelineStack(app, 'PipelineTestStack');
    //WHEN
    PipelineTestStack.createServiceStage(ServiceTestStack, 'Test');
    //THEN
    expectCDK(PipelineTestStack).to(haveResourceLike('AWS::CodePipeline::Pipeline', {
        Stages: arrayWith(objectLike({
            Name: 'Test'
        }))
    }))
});

test('Adding BillingStack to Prod Stage', () => {
    //GIVEN
    const app = new App();
    const ServiceTestStack = new ServiceStack(app, 'ServiceTestStack', {stageName: 'dummy'});
    const PipelineTestStack = new Pipeline.PipelineStack(app, 'PipelineTestStack');
    const BillingTestStack = new BillingStack(app, 'BillingTestStack', {
        amount: 1,
        emailAddress: 'sharan.samir@gmail.com'
    });
    const stage = PipelineTestStack.createServiceStage(ServiceTestStack, 'Test');
    //WHEN
    PipelineTestStack.addBillingStacktoStage(BillingTestStack, stage);
    //THEN
    expectCDK(PipelineTestStack).to(haveResourceLike('AWS::CodePipeline::Pipeline', {
        Stages: arrayWith(objectLike({
            Actions: arrayWith(objectLike({
                Name: "Billing_Update"
            }))
        }))
    }))
})