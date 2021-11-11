import * as cdk from 'aws-cdk-lib';
import * as Pipeline from '../lib/pipeline-stack';
import { SynthUtils} from '@aws-cdk/assert';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Pipeline.PipelineStack(app, 'MyTestStack');
    // THEN
    expect(SynthUtils.toCloudFormation).toMatchSnapshot();
});
