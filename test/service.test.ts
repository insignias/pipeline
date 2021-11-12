import { App} from 'aws-cdk-lib';
import { ServiceStack} from '../lib/service-stack';
import { expect as expectCDK, SynthUtils} from '@aws-cdk/assert';

test('ServiceStackTest', () => {
    const app = new App();
    // WHEN
    const stack = new ServiceStack(app, 'ServiceStackTest');
    // THEN
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});