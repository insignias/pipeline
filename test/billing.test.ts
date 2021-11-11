import * as cdk from 'aws-cdk-lib';
import { BillingStack } from '../lib/billing-stack';
import { SynthUtils} from '@aws-cdk/assert';

test('BillingStack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BillingStack(app, 'BillingStack', {
        amount: 1,
        emailAddress: 'sharan.samir@gmail.com'
    });
    // THEN
    // expect(SynthUtils.toCloudFormation(stack)
});
