import * as cdk from 'aws-cdk-lib';
import * as Pipeline from '../lib/pipeline-stack';
import { SynthUtils} from '@aws-cdk/assert';

test('PipelineStack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Pipeline.PipelineStack(app, 'PipelineStack');
    // THEN
    expect(SynthUtils.toCloudFormation).toMatchSnapshot();
});
