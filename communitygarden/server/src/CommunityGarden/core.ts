import { Connection, createConnection, getConnectionOptions } from "typeorm";
import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";

export type LocalFood = {
    req: Request & {
        session: Session & Partial<SessionData> & { publicId: string, farmId: string };
    };
    redis: Redis;
    res: Response;
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

    DatabaseConnect: async (): Promise<Connection> => {
        const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
        // must use name default for jest
        // take the options from either development or test and rename connection to make it work
        return createConnection({ ...connectionOptions, name: "default" });
    },


    SendEmail: async (data: SignUpEmail) => {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: data.to,
            from: data.from,
            subject: data.subject,
            text: data.text,
        };
        sgMail.send(msg).
            then(console.log("Email sent.")).
            catch((err: any) => {
                console.log(err);
            });
    }


}

export default CommunityGarden;