import { CfnBudget } from "aws-cdk-lib/lib/aws-budgets";
import { Construct } from "constructs";

interface BillingProps {
    amount: number;
    emailAddress: string;
}

export class Budget extends Construct{
    constructor(scope: Construct, id: string, props: BillingProps){
        super(scope, id);

        new CfnBudget(this, 'Budget', {
            budget: {
                budgetLimit: {
                    amount: props.amount,
                    unit: 'USD'
                },
                budgetName: 'Budget',
                budgetType: 'COST',
                timeUnit: 'MONTHLY'
            },
            notificationsWithSubscribers: [
                {
                    notification: {
                        comparisonOperator: 'GREATER_THAN',
                        notificationType: 'ACTUAL',
                        threshold: 100,
                        thresholdType: 'PERCENTAGE'
                    },
                    subscribers: [
                        {
                            address: props.emailAddress,
                            subscriptionType: 'EMAIL'
                        },
                    ]
                },
            ]
        })
    }
}