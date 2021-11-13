import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/lib/aws-codebuild';
import { Artifact, IStage, Pipeline } from 'aws-cdk-lib/lib/aws-codepipeline';
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, CodeBuildActionType, GitHubSourceAction } from 'aws-cdk-lib/lib/aws-codepipeline-actions';
import { EventField, RuleTargetInput } from 'aws-cdk-lib/lib/aws-events';
import { SnsTopic } from 'aws-cdk-lib/lib/aws-events-targets';
import { Sns } from 'aws-cdk-lib/lib/aws-ses-actions';
import { Topic } from 'aws-cdk-lib/lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { BillingStack } from './billing-stack';
import { ServiceStack } from './service-stack';

export class PipelineStack extends Stack {
  private pipeline: Pipeline;
  private cdkBuildOutput: Artifact;
  private serviceBuildOutput: Artifact;
  private pipelineNotificationTopic: Topic;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.pipelineNotificationTopic = new Topic(this, 'PipelineNotificationTopic', {
      topicName: 'PipelineNotification'
    })

    this.pipelineNotificationTopic.addSubscription(new EmailSubscription('sharan.samir@gmail.com'));

    this.pipeline = new Pipeline(this, "Pipeline", {
      pipelineName: "Pipeline",
      crossAccountKeys: true,
      restartExecutionOnUpdate: true,
    });

    const cdkSourceOutput = new Artifact("CDKSourceOutput");
    const serviceSourceOutput = new Artifact("ServiceSourceOutput");

    this.pipeline.addStage({
      stageName: "Source",
      actions: [
        new GitHubSourceAction({
          owner: "insignias",
          repo: "pipeline",
          branch: "main",
          actionName: "Pipeline_Source",
          oauthToken: SecretValue.secretsManager("github-token"),
          output: cdkSourceOutput,
        }),
        new GitHubSourceAction({
          owner: "insignias",
          repo: "express-lambda",
          branch: "main",
          actionName: "Service_Source",
          oauthToken: SecretValue.secretsManager("github-token"),
          output: serviceSourceOutput,
        })
      ]
    });

    this.cdkBuildOutput = new Artifact("CdkBuildOutput");
    this.serviceBuildOutput = new Artifact("ServiceBuildOutput");

    this.pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: "CDK_Build",
          input: cdkSourceOutput,
          outputs: [this.cdkBuildOutput],
          project: new PipelineProject(this, "CdkBuildProject", {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromSourceFilename(
              "build-specs/cdk-build-spec.yml"
            ),
          }),
        }),
        new CodeBuildAction({
          actionName: "Service_Build",
          input: serviceSourceOutput,
          outputs: [this.serviceBuildOutput],
          project: new PipelineProject(this, "ServiceBuildProject", {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromSourceFilename(
              "build-specs/service-build-spec.yml"
            ),
          }),
        })
      ]
    });

    this.pipeline.addStage({
      stageName: "Pipeline_Update",
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: "Pipeline_Update",
          stackName: "PipelineStack",
          templatePath: this.cdkBuildOutput.atPath(
            "PipelineStack.template.json"
          ),
          adminPermissions: true,
        }),
      ],
    });
  }

  public createServiceStage(serviceStack: ServiceStack, stageName: string): IStage {
    return this.pipeline.addStage({
      stageName: stageName,
      actions: [ 
        new CloudFormationCreateUpdateStackAction({
          actionName: 'Service_Update',
          stackName: serviceStack.stackName,
          templatePath: this.cdkBuildOutput.atPath(`${serviceStack.stackName}.template.json`),
          adminPermissions: true,
          parameterOverrides: {
            ...serviceStack.serviceCode.assign(this.serviceBuildOutput.s3Location)
          },
          extraInputs: [this.serviceBuildOutput]
        }),
      ]
    })
  }

  public addBillingStacktoStage(billingStack: BillingStack, stage: IStage) {
    stage.addAction(
      new CloudFormationCreateUpdateStackAction({
        actionName: 'Billing_Update',
        stackName: billingStack.stackName,
        templatePath: this.cdkBuildOutput.atPath(`${billingStack.stackName}.template.json`),
        adminPermissions: true
      })
    )
  }

  public addIntegrationTestToStage(stage: IStage, serviceEndpoint: string) {
    const integrationAction = new CodeBuildAction({
      actionName: 'Integration_Test',
      input: this.serviceBuildOutput,
      project: new PipelineProject(this, 'Intergration_Test', {
        environment: {
          buildImage: LinuxBuildImage.STANDARD_5_0
        },
        buildSpec: BuildSpec.fromSourceFilename('build-specs/integ-test-build-spec.yml')
      }),
      environmentVariables: {
        SERVICE_ENDPOINT: {
          value: serviceEndpoint
        }
      },
      type: CodeBuildActionType.TEST,
      runOrder: 2
    });

    stage.addAction(integrationAction);
    integrationAction.onStateChange('PipelineFailureNotification', new SnsTopic(this.pipelineNotificationTopic, {
      message: RuleTargetInput.fromText(`Integration Test Failed, please see the link for details: ${EventField.fromPath("$.detail.execution-result.external-execution-url")}`)
    }),
    {
      ruleName: 'IntegrationTestFailed',
      eventPattern: {
        detail: {
          state: ["FAILED"]
        }
      },
      description: 'Integration Test has failed'
    }
    )
  }
}

  
