#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { ServiceStack } from '../lib/service-stack';

const app = new cdk.App();
new PipelineStack(app, 'PipelineStack', {});
new ServiceStack(app, 'ServiceStack', {});