import { App} from 'aws-cdk-lib';
import { ServiceStack} from '../lib/service-stack';
import { expect as expectCDK, SynthUtils} from '@aws-cdk/assert';

test('ServiceStackTest', () => {
    const app = new App();
    // WHEN
    const stack = new ServiceStack(app, 'ServiceStackTest', {stageName: 'dummy'});
    // THEN
    // expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});