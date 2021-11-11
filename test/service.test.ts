import { App} from 'aws-cdk-lib';
import { ServiceStack} from '../lib/service-stack';
import { SynthUtils} from '@aws-cdk/assert';

test('ServiceStackTest', () => {
    const app = new App();
    // WHEN
    const stack1 = new ServiceStack(app, 'ServiceStackTest');
    // THEN
    // expect(SynthUtils.toCloudFormation(stack1)
    // expect(SynthUtils.toCloudFormation).toMatchSnapshot();
});