import * as cdk from 'aws-cdk-lib';
import * as Service from '../lib/service-stack';
import { SynthUtils} from '@aws-cdk/assert';

test('PipelineStack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Service.ServiceStack(app, 'PipelineStack');
    // THEN
    expect(SynthUtils.toCloudFormation).toMatchSnapshot();
});