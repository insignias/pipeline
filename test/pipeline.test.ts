import * as cdk from 'aws-cdk-lib';
import * as Pipeline from '../lib/pipeline-stack';
import { arrayWith, expect as expectCDK, haveResourceLike, objectLike, SynthUtils} from '@aws-cdk/assert';
import { App } from 'aws-cdk-lib';
import { ServiceStack } from '../lib/service-stack';

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
    //WHEN
    const ServiceTestStack = new ServiceStack(app, 'ServiceTestStack');
    const PipelineTestStack = new Pipeline.PipelineStack(app, 'PipelineTestStack');
    PipelineTestStack.createServiceStage(ServiceTestStack, 'Test');
    //THEN
    expectCDK(PipelineTestStack).to(haveResourceLike('AWS::CodePipeline::Pipeline', {
        Stages: arrayWith(objectLike({
            Name: 'Test'
        }))
    }))
});