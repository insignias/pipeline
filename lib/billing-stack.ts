import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Budget } from "./Construct/budget";

interface BillingStackProps extends StackProps{
    amount: number,
    emailAddress: string
}

export class BillingStack extends Stack{
    constructor(scope: Construct, id: string, props: BillingStackProps){
        super(scope, id, props);

        new Budget(this, 'Budget', {
            amount: props.amount,
            emailAddress: props.emailAddress
        })
    }
}