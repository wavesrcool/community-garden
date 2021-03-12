import "reflect-metadata";
import * as dotenv from "dotenv"
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { DualCredential, SignUpPublicInput, SignUpFarmInput, UpdateAccountIdentityInput, UpdateAccountEmailInput, UpdateFarmIdentityInput, UpdateFarmDeliveryGradientInput } from "../Topology/Figures/InputTypes";
import { PublicResponse, ErrorList, SignUpResponse, GraphResponse, LoginResponse } from "../Topology/Figures/ObjectTypes";
import GraphValidate from "../Functions/GraphValidate";
import GraphCompose from "../Functions/GraphCompose";
import CommunityGarden, { LocalFood } from "../../CommunityGarden/core";
import { Account } from "../Topology/Atlas/Account";
import { AccountType } from "../Topology/Figures/EnumTypes";
import argon2 from "argon2";
import { v4 } from "uuid";

dotenv.config()
const PREFIX_FORGOT_PASSWORD = process.env.REDIS_FORGOT_PASSWORD_PREFIX;

@Resolver()
export class CommunityGarden1 {
    @Mutation(() => SignUpResponse)
    async signUpPublic(
        @Arg("input") input: SignUpPublicInput,
        @Ctx() { req }: LocalFood,
    ): Promise<SignUpResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpPublic(input);
        if (errors) {
            return { errors };
        }

        const resp: SignUpResponse = await GraphCompose.SignUpPublic(input);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        if (!resp.account) {
            return {
                errors: [
                    {
                        path: "signUpAccount",
                        message: `Bad response: ${resp}`
                    }
                ],
            };
        }
        /*
        await CommunityGarden.SendEmail(
            {
                to: input.email,
                from: "wavesrcool@icloud.com",
                subject: "Verify your email address",
                text: `${resp.account}`
            }
        );*/

        req.session.publicId = resp.account;
        console.log("Community Garden server... signUpPublic, success...", resp)
        return {
            username: resp.username,
            account: resp.account,
        }
    };

    @Mutation(() => SignUpResponse)
    async signUpFarm(
        @Arg("input") input: SignUpFarmInput,
        @Ctx() { req }: LocalFood,
    ): Promise<SignUpResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpFarm(input);
        if (errors) {
            return { errors };
        }

        const resp: SignUpResponse = await GraphCompose.SignUpFarm(input);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        if (!resp.account || !resp.farm) {
            return {
                errors: [
                    {
                        path: "signUpFarm",
                        message: `Bad response: ${resp}`
                    }
                ],
            };
        }

        /*
        await CommunityGarden.SendEmail(
            {
                to: input.email,
                from: "wavesrcool@icloud.com",
                subject: "Verify your email address",
                text: `${resp.account}`
            }
        );*/

        req.session.publicId = resp.account;
        req.session.farmId = resp.farm;
        console.log("Community Garden server... SignUpFarm, success...", resp)
        return {
            username: resp.username,
            account: resp.account,
            farm: resp.farm,
        }
    }

    @Mutation(() => Boolean)
    async verifyEmail(
        @Arg("input") input: string
    ): Promise<Boolean> {
        if (input) {
            return true
        }
        return false
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg("input") input: DualCredential,
        @Ctx() { req }: LocalFood,
    ): Promise<LoginResponse> {
        const errors: ErrorList[] | null = await GraphValidate.Login(input);
        if (errors) {
            return { errors };
        }

        const resp: LoginResponse = await GraphCompose.LoginAccount(input);

        if (resp.errors) {
            return { errors: resp.errors }
        }

        if (resp.account) {
            switch (resp.account.account_type) {
                case AccountType.PUBLIC: {
                    req.session.publicId = resp.account.cg;
                    console.log("Community Garden server... login, success...", resp.account.account_type, resp.account.username)
                    return resp;
                }
                case AccountType.FARM: {
                    req.session.publicId = resp.account.cg;
                    req.session.farmId = resp.account.farm.cg;
                    console.log("Community Garden server... login, success...", resp.account.account_type, resp.account.username)
                    return resp;
                }
                default: {
                    return {
                        errors: [
                            {
                                path: "login",
                                message: `Switch default: ${input.username}`
                            }
                        ],
                    };
                }
            }
        }

        else {
            return {
                errors: [
                    {
                        path: "login",
                        message: `Else condition: ${input.username}`
                    }
                ],
            };
        }
    };

    @Mutation(() => Boolean)
    async logout(
        @Ctx() { req, res }: LocalFood
    ): Promise<Boolean> {
        return new Promise(yay => req.session.destroy(err => {
            res.clearCookie(process.env.COOKIE_NAME as string);
            if (err) {
                console.log(`ERROR \'logout\', req.session.destroy: ${err}`);
                yay(false);
                return;
            }
            yay(true);
        }));
    };

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
            await redis.set(PREFIX_FORGOT_PASSWORD + token, resp.account.cg, "ex", 1000 * 60 * 60);

            //const reset_html = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`;

            const send_email = await CommunityGarden.SendEmail(
                {
                    to: email,
                    from: "wavesrcool@icloud.com",
                    subject: "Change password token",
                    text: `${token}`
                }
            );

            if (send_email) {
                return true;
            }
            return false;
        } else {
            return false;
        }

    }

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

        const key = PREFIX_FORGOT_PASSWORD + token;

        console.log("key...", key)
        console.log("key...", await redis.get(key))

        const account_cg = await redis.get(key);
        console.log("redis get key ...", account_cg)

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
    async deleteAccount(
        @Arg("input") input: DualCredential,
        @Ctx() { req, res }: LocalFood
    ): Promise<Boolean> {
        if (!req.session.publicId) {
            console.log(`Community Garden server... error, \'deleteAccount\' cookie: ${req.session.publicId}`);
            return false;
        }
        const resp: GraphResponse = await GraphCompose.DeleteAccount(input, req.session.publicId);

        if (resp.errors) {
            console.log(`Community Garden, \'deleteAccount\' errors: ${resp.errors[0].message}`);
            return false;
        }

        if (resp.deleted == true && resp.account) {
            if (resp.account.cg == req.session.publicId) {
                return new Promise(yay => req.session.destroy(err => {
                    res.clearCookie(process.env.COOKIE_NAME as string);
                    if (err) {
                        console.log(`ERROR, \'deleteAccount\' req.session.destroy error: ${err}`);
                        yay(false);
                        return;
                    }
                    yay(true);
                }));
            } else {
                console.log(`ERROR, \'deleteAccount\': inner else condition`);
                return false;
            }
        } else {
            console.log(`ERROR, \'deleteAccount\': else condition`);
            return false;
        }
    }

    @Mutation(() => GraphResponse)
    async deleteFarm(
        @Arg("input") input: DualCredential,
        @Ctx() { req }: LocalFood
    ): Promise<GraphResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "deleteFarm",
                        message: `Cookie publicId: ${req.session.publicId}`
                    }
                ],
            };
        }
        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "deleteFarm",
                        message: `Cookie farmId: ${req.session.farmId}`
                    }
                ],
            };
        }
        const resp: GraphResponse = await GraphCompose.DeleteFarm(input, req.session.publicId, req.session.farmId);

        if (resp.errors) {
            return resp;
        }

        if (!resp.errors && resp.deleted == true && resp.farm) {
            console.log("Community Garden server... deleteFarm, success...", resp)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "deleteFarm",
                        message: `Else condition farmId: ${req.session.farmId}`
                    }
                ],
            };
        }
    }

    @Mutation(() => GraphResponse)
    async updateAccountIdentity(
        @Arg("input") input: UpdateAccountIdentityInput,
        @Ctx() { req }: LocalFood
    ): Promise<GraphResponse> {
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

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountIdentity(input);
        if (errors) {
            return { errors };
        }

        const resp: GraphResponse = await GraphCompose.UpdateAccountIdentity(input, req.session.publicId);

        if (resp.errors) {
            return resp;
        }

        if (resp.updated == true && resp.account) {
            console.log("Community Garden server... updateAccountIdentity, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: `Else condition publicId: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Mutation(() => GraphResponse)
    async updateAccountEmail(
        @Arg("input") input: UpdateAccountEmailInput,
        @Ctx() { req }: LocalFood
    ): Promise<GraphResponse> {
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

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountEmail(input);
        if (errors) {
            return { errors };
        }

        const resp: GraphResponse = await GraphCompose.UpdateAccountEmail(input, req.session.publicId);

        if (resp.errors) {
            return resp;
        }

        if (resp.updated == true && resp.account) {
            console.log("Community Garden server... updateAccountEmail, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateAccountEmail",
                        message: `Else condition publicId: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    /*
    @Mutation(() => GraphResponse)
    async updateAccountGeocode(
        @Arg("input") input: UpdateAccountGeocodeInput,
        @Ctx() { req }: LocalFood
    ): Promise<GraphResponse> {
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

        const errors: ErrorList[] | null = await GraphValidate.UpdateAccountGeocode(input);
        if (errors) {
            return { errors };
        }

        const resp: GraphResponse = await GraphCompose.UpdateAccountGeocode(input, req.session.publicId);

        if (resp.errors) {
            return resp;
        }

        if (!resp.errors && resp.updated == true && resp.account) {
            console.log("Community Garden server... updateAccountGeocode, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateAccountIdentity",
                        message: `Else condition publicId: ${req.session.publicId}`
                    }
                ],
            };
        }
    }*/

    @Mutation(() => GraphResponse)
    async updateFarmIdentity(
        @Arg("input") input: UpdateFarmIdentityInput,
        @Ctx() { req }: LocalFood
    ): Promise<GraphResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateFarmIdentity",
                        message: `Cookie: publicId ${req.session.publicId}`
                    }
                ],
            };
        }

        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "updateFarmIdentity",
                        message: `Cookie: farmId ${req.session.farmId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateFarmIdentity(input);
        if (errors) {
            return { errors };
        }

        const resp: GraphResponse = await GraphCompose.UpdateFarmIdentity(input, req.session.publicId, req.session.farmId);

        if (resp.errors) {
            return resp;
        }

        if (!resp.errors && resp.updated == true && resp.account) {
            console.log("Community Garden server... updateFarmIdentity, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateFarmIdentity",
                        message: `Else condition publicId: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Mutation(() => GraphResponse)
    async updateFarmDeliveryGradient(
        @Arg("input") input: UpdateFarmDeliveryGradientInput,
        @Ctx() { req }: LocalFood
    ): Promise<GraphResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "updateFarmDeliveryGradient",
                        message: `Cookie: publicId ${req.session.publicId}`
                    }
                ],
            };
        }

        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "updateFarmDeliveryGradient",
                        message: `Cookie: farmId ${req.session.farmId}`
                    }
                ],
            };
        }

        const errors: ErrorList[] | null = await GraphValidate.UpdateFarmDeliveryGradient(input);
        if (errors) {
            return { errors };
        }

        const resp: GraphResponse = await GraphCompose.UpdateFarmDeliveryGradient(input, req.session.publicId, req.session.farmId);

        if (resp.errors) {
            return resp;
        }

        if (!resp.errors && resp.updated == true && resp.account) {
            console.log("Community Garden server... updateFarmDeliveryGradient, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "updateFarmIdentity",
                        message: `Else condition publicId: ${req.session.publicId}`
                    }
                ],
            };
        }
    };

    @Query(() => [Account])
    async accounts(): Promise<Account[]> {
        return Account.find()
    }

    @Query(() => PublicResponse)
    async account(
        @Arg("username") username: string,
        //@Ctx() { req }: LocalFood,
    ): Promise<PublicResponse> {
        /*if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "account",
                        message: "No publicId on cookie"
                    }
                ]
            };
        }*/
        const account = await Account.findOne({ where: { username } });
        return { account };
    }

    @Query(() => Account, { nullable: true })
    async active(
        @Ctx() { req }: LocalFood
    ) {
        if (!req.session.publicId) {
            return null;
        }

        return Account.findOne({ where: { cg: req.session.publicId } });
    }

}