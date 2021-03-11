import { Connection, createConnection, getConnectionOptions, getManager } from "typeorm";
import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";
import { GraphQLClient } from "graphql-request";
import { Account } from "../Graph/Topology/Atlas/Account";

export type LocalFood = {
    req: Request & {
        session: Session & Partial<SessionData> & {
            publicId: string,
            farmId: string,

        };
    };
    redis: Redis;
    res: Response;
    bt: GraphQLClient,
};

type SignUpEmail = {
    to: string;
    from: string;
    subject: string;
    text: string

}

const CommunityGarden = {
    decode64: (str: string): string => Buffer.from(str, 'base64').toString('binary'),
    encode64: (str: string): string => Buffer.from(str, 'binary').toString('base64'),
    AngularRadius: async (): Promise<number> => {
        return 0.001567855942887398;
    },

    PublicCookie: async (publicId: string): Promise<Boolean> => {
        if (!publicId) {
            return false
        } else {
            return true
        }
    },

    FarmCookie: async (farmId: string): Promise<Boolean> => {
        if (!farmId) {
            return false;
        } else {
            return true;
        }
    },

    UniqueEmail: async (email: string): Promise<Boolean> => {
        const account_with_email = await getManager()
            .createQueryBuilder(Account, "account")
            .where("account.email = :email", { email })
            .getOne();

        if (!account_with_email) {
            return true;
        } else {
            return false;
        }
    },

    BraintreeClient: async (): Promise<GraphQLClient> => {
        const endpoint = process.env.BRAINTREE_SANDBOX_API_ENDPOINT;

        const keypair = process.env.BRAINTREE_SANDBOX_PUBLIC_KEY + ":" + process.env.BRAINTREE_SANDBOX_PRIVATE_KEY;
        //console.log("keypair, ", keypair);

        const BraintreeClient = new GraphQLClient(endpoint as string, {
            headers: {
                "authorization": "Bearer " + CommunityGarden.encode64(keypair as string),
                "Braintree-Version": "2021-02-26",
                "Content-Type": "application/json",
            }
        });

        return BraintreeClient;
    },

    DatabaseConnect: async (): Promise<Connection> => {
        const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
        // must use name default for jest
        // take the options from either development or test and rename connection to make it work
        return createConnection({ ...connectionOptions, name: "default" });
    },


    SendEmail: async (data: SignUpEmail): Promise<Boolean> => {
        try {
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg = {
                to: data.to,
                from: data.from,
                subject: data.subject,
                text: data.text,
            };
            sgMail.send(msg).
                then(console.log(`Email sent to ${data.to}`)).
                catch((err: any) => {
                    console.log(err);
                    return false;
                });
            return true;
        } catch (err) {
            console.log(err)
            return false
        }
    }


}

export default CommunityGarden;