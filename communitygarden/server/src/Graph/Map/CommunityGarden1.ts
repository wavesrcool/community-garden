import "reflect-metadata";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { v4 } from "uuid";
import argon2 from "argon2"
import sendgrid from "@sendgrid/mail"

import { DeleteAccountInput, UpdateAccountIdentityInput, UpdateAccountEmailInput, UpdateAccountGeocodeInput, UpdateFarmGeocodeInput } from "../Topology/Figures/InputTypes";
import { PublicResponse, ErrorList } from "../Topology/Figures/ObjectTypes";
import GraphValidate from "../Functions/Validate/GraphValidate";
import GraphCompose from "../Functions/Compose/GraphCompose";
import { Account } from "../Topology/Atlas/Account";
import { LocalFood } from "server/src/CommunityGarden/core";

const COOKIE = process.env.COOKIE;
const PREFIX = process.env.REDIS_FORGOT_PASSWORD;

@Resolver()
export class CommunityGarden1 {
    @Mutation(() => PublicResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { req, redis }: LocalFood
    ): Promise<PublicResponse> {
        const errors = await GraphValidate.ChangePassword(newPassword);
        if (errors) {
            return { errors };
        }


        const key = PREFIX + token;
        const account_cg = await redis.get(key);

        if (!account_cg) {
            return {
                errors: [
                    {
                        path: "changePassword",
                        message: `Token expired or tampered: ${token}`
                    }
                ],
            };
        }

        const account = await Account.findOne({ where: { cg: account_cg } });

        if (!account) {
            return {
                errors: [
                    {
                        path: "changePassword",
                        message: `User no longer exists, token: ${token}`
                    }
                ],
            };
        }

        await Account.update(
            { cg: account.cg },
            { password: await argon2.hash(newPassword) }
        );

        await redis.del(key);

        // log account in
        req.session.publicId = account.cg;
        return { account };

    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: LocalFood
    ) {
        const resp: PublicResponse = await GraphCompose.ForgotPassword(email);
        if (resp.errors) {
            return false
        }

        if (resp.account) {
            // create a token... store the token in redis associated with the account cg
            // when 
            const token = v4();

            // (key) searchable prefix (value) account.cg
            // expiry in 1 hour
            await redis.set(PREFIX + token, resp.account.cg, "ex", 1000 * 60 * 60);

            const reset_html = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`;

            const api_key = process.env.COMMUNITY_GARDEN_SENDGRID_API_KEY
            sendgrid.setApiKey(api_key as string)
            const msg = {
                to: 'ilovesunrises@icloud.com', // Change to your recipient
                from: 'wavesrcool@icloud.com', // Change to your verified sender
                subject: 'Change Password',
                //text: 'and easy to do anywhere, even with Node.js',
                html: reset_html,
            }
            sendgrid
                .send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                })

            return true;
        }

        return false;

    }
    @Mutation(() => Boolean)
    async deleteAccount(
        @Arg("delete_credentials") delete_credentials: DeleteAccountInput,
        @Ctx() { req, res }: LocalFood
    ): Promise<Boolean> {
        if (!req.session.publicId) {
            console.log(`Community Garden, \'deleteAccount\' cookie: ${req.session.publicId}`);
            return false;
        }
        const resp: PublicResponse = await GraphCompose.DeleteAccount(delete_credentials);

        if (resp.errors) {
            console.log(`Community Garden, \'deleteAccount\' errors: ${resp.errors[0].message}`);
            return false;
        }

        if (resp.deleted == true) {
            return new Promise(yay => req.session.destroy(err => {
                res.clearCookie(COOKIE as string);
                if (err) {
                    console.log(`Community Garden, \'deleteAccount\' destroy... : ${err}`);
                    yay(false);
                    return;
                }
                yay(true);
            }));
        } else {
            console.log(`Community Garden, \'deleteAccount\': else condition`);
            return false;
        }
    }

    @Mutation(() => PublicResponse)
    async updateAccountIdentity(
        @Arg("update_data") update_data: UpdateAccountIdentityInput,
        @Ctx() { req }: LocalFood
    ): Promise<PublicResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: `Cookie: ${req.session.publicId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountIdentity(update_data);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.UpdateAccountIdentity(update_data, req.session.publicId);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            //req.session.publicId = resp.account.cg;
            //console.log(resp);
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: `Else condition: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Mutation(() => PublicResponse)
    async updateAccountEmail(
        @Arg("update_data") update_data: UpdateAccountEmailInput,
        @Ctx() { req }: LocalFood
    ): Promise<PublicResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountEmail",
                        message: `Cookie: ${req.session.publicId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountEmail(update_data);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.UpdateAccountEmail(update_data, req.session.publicId);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            //req.session.publicId = resp.account.cg;
            //console.log(resp);
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "updateAccountEmail",
                        message: `Else condition: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Mutation(() => PublicResponse)
    async updateAccountGeocode(
        @Arg("update_data") update_data: UpdateAccountGeocodeInput,
        @Ctx() { req }: LocalFood
    ): Promise<PublicResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: `Cookie: ${req.session.publicId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountGeocode(update_data);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.UpdateAccountGeocode(update_data, req.session.publicId);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            //req.session.publicId = resp.account.cg;
            //console.log(resp);
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: `Else condition: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Mutation(() => PublicResponse)
    async updateFarmGeocode(
        @Arg("update_data") update_data: UpdateFarmGeocodeInput,
        @Ctx() { req }: LocalFood
    ): Promise<PublicResponse> {
        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: `Cookie farmId: ${req.session.farmId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateFarmGeocode(update_data);
        if (errors) {
            return { errors };
        }

        const resp: PublicResponse = await GraphCompose.UpdateFarmGeocode(update_data, req.session.farmId);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        else if (resp.account) {
            //req.session.publicId = resp.account.cg;
            //console.log(resp);
            return resp;
        }

        else {
            return {
                errors: [
                    {
                        path: "updateAccountGeocode",
                        message: `Else condition: ${req.session.publicId}`
                    }
                ],
            };
        }
    };
}