#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { ServiceStack } from '../lib/service-stack';
import { BillingStack } from '../lib/billing-stack';

const app = new cdk.App();
new BillingStack(app, 'BillingStack', {
  amount: 5,
  emailAddress: 'sharan.samir@gmail.com'
});

const pipeline = new PipelineStack(app, 'PipelineStack', {});
const serviceStackProd = new ServiceStack(app, 'ServiceStackProd', {});
pipeline.createServiceStage(serviceStackProd, 'Prod');