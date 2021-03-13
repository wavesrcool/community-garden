import "reflect-metadata";
import * as dotenv from "dotenv"
import argon2 from "argon2";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { DualCredential, SignUpPublicInput, SignUpFarmInput, UniquesCredential, ChangePasswordInput } from "../Topology/Figures/InputTypes";
import { PublicResponse, ErrorList, SignUpResponse, AccountResponse, DeleteAccountResponse } from "../Topology/Figures/ObjectTypes";
import GraphValidate from "../Functions/GraphValidate";
import CommunityGarden, { LocalFood } from "../../CommunityGarden/core";
import { Account } from "../Topology/Atlas/Account";
import { AccountType } from "../Topology/Figures/EnumTypes";
import { v4 } from "uuid";
import { createQueryBuilder } from "typeorm";
import GraphShape1 from "../Functions/GraphShape1";

dotenv.config()

@Resolver()
export class CommunityGarden1 {
    @Mutation(() => SignUpResponse)
    async signUpPublic(
        @Arg("input") input: SignUpPublicInput,
    ): Promise<SignUpResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpPublic(input);
        if (errors) {
            return { errors };
        }

        const resp: SignUpResponse = await GraphShape1.SignUpPublic(input)

        if (resp.errors) {
            return { errors: resp.errors };
        }

        if (!resp.account) {
            return {
                errors: [
                    {
                        path: "signUpPublic",
                        message: `CommunityGarden Map 1: Error 1`
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

        //req.session.publicId = resp.account;
        console.log("Community Garden server... signUpPublic, success...", resp.account_type, resp.username)
        return {
            username: resp.username,
            account: resp.account,
            account_type: resp.account_type
        }
    };

    @Mutation(() => SignUpResponse)
    async signUpFarm(
        @Arg("input") input: SignUpFarmInput,
    ): Promise<SignUpResponse> {
        const errors: ErrorList[] | null = await GraphValidate.SignUpFarm(input);
        if (errors) {
            return { errors };
        }

        const resp: SignUpResponse = await GraphShape1.SignUpFarm(input);

        if (resp.errors) {
            return { errors: resp.errors };
        }

        if (!resp.account) {
            return {
                errors: [
                    {
                        path: "signUpFarm",
                        message: `CommunityGarden Map 1: Error 1`
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

        //req.session.publicId = resp.account;
        //req.session.farmId = resp.farm;
        console.log("Community Garden server... signUpFarm, success...", resp.account_type, resp.username)
        return {
            username: resp.username,
            account: resp.account,
            account_type: resp.account_type
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

    @Mutation(() => AccountResponse)
    async login(
        @Arg("input") input: DualCredential,
        @Ctx() { req }: LocalFood,
    ): Promise<AccountResponse> {
        const errors: ErrorList[] | null = await GraphValidate.Login(input);
        if (errors) {
            return { errors };
        }

        const resp: AccountResponse = await GraphShape1.LoginAccount(input);
        console.log("LOGIN resp", resp)

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
                                path: "signUpFarm",
                                message: "CommunityGarden Map 1: Error 1"
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
                        path: "signUpFarm",
                        message: "CommunityGarden Map 1: Error 2"
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
                console.log(`ERROR:: \'logout\', ${err}`);
                yay(false);
                return;
            }
            yay(true);
        }));
    };

    @Mutation(() => PublicResponse)
    async forgotPassword(
        @Arg("input") input: UniquesCredential,
        @Ctx() { redis }: LocalFood
    ): Promise<PublicResponse> {
        const resp: PublicResponse = await GraphShape1.ForgotPassword(input);
        if (resp.errors) {
            return { errors: resp.errors };
        }

        if (resp.communitygarden) {
            // create a token... store the token in redis associated with the account cg
            const token = v4();

            // (key) searchable prefix (value) account.cg
            // expiry in 1 hour
            await redis.set((process.env.REDIS_PREFIX_FP as string) + token, resp.communitygarden, "ex", 1000 * 60 * 60);

            //const reset_html = `<a href="http://localhost:3000/change-password/${token}">reset password</a>`;

            const send_email = await CommunityGarden.SendEmail(
                {
                    to: input.email,
                    from: "wavesrcool@icloud.com",
                    subject: "Change password token",
                    text: `${token}`
                }
            );

            if (send_email) {
                return { communitygarden: resp.communitygarden };
            } else {
                return {
                    errors: [
                        {
                            path: "forgotPassword",
                            message: "CommunityGarden Map 1: Error 1"
                        }
                    ],
                };
            }
        } else {
            return {
                errors: [
                    {
                        path: "forgotPassword",
                        message: "CommunityGarden Map 1: Error 2"
                    }
                ],
            };
        }

    }

    @Mutation(() => AccountResponse)
    async changePassword(
        @Arg("input") input: ChangePasswordInput,
        @Ctx() { req, redis }: LocalFood
    ): Promise<AccountResponse> {
        const errors: ErrorList[] | null = await GraphValidate.ChangePassword(input.new_password);
        if (errors) {
            return { errors };
        }

        const key = (process.env.REDIS_PREFIX_FP as string) + input.token;
        const redis_acct_cg = await redis.get(key);

        if (!redis_acct_cg) {
            return {
                errors: [
                    {
                        path: "changePassword",
                        message: `Community Garden Map 1: Error 1`
                    }
                ],
            };
        }

        const acct = await createQueryBuilder(Account, "account")
            .where("account.cg = :cg", { cg: redis_acct_cg })
            .getOne()

        if (!acct) {
            return {
                errors: [
                    {
                        path: "changePassword",
                        message: `Community Garden Map 1: Account no longer exists, ${input.token}`
                    }
                ],
            };
        }

        const updated_acct = await createQueryBuilder()
            .update(Account)
            .set(
                {
                    password: await argon2.hash(input.new_password)
                })
            .where("cg = :cg", { cg: redis_acct_cg })
            .returning('id')
            .execute();

        const updated_acct_id: number = updated_acct.raw[0].id;

        if (!(acct.id == updated_acct_id)) {
            return {
                errors: [
                    {
                        path: "changePassword",
                        message: "Community Garden Map 1: Error 2"
                    }
                ],
            };
        } else {
            await redis.del(key);

            // log account in

            const acct_updated = await createQueryBuilder(Account, "account")
                .where("account.cg = :cg", { cg: redis_acct_cg })
                .andWhere("account.id = :id", { id: updated_acct_id })
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .getOne()
            if (acct_updated) {
                switch (acct_updated.account_type) {
                    case AccountType.PUBLIC: {
                        req.session.publicId = acct_updated.cg;
                        console.log("Community Garden server... changePassword, success...", acct_updated.account_type, acct_updated.username)
                        return { account: acct_updated };
                    }
                    case AccountType.FARM: {
                        req.session.publicId = acct_updated.cg;
                        req.session.farmId = acct_updated.farm.cg;
                        console.log("Community Garden server... changePassword, success...", acct_updated.account_type, acct_updated.username)
                        return { account: acct_updated };
                    }
                    default: {
                        return {
                            errors: [
                                {
                                    path: "changePassword",
                                    message: "CommunityGarden Map 1: Error 3"
                                }
                            ],
                        };
                    }
                }

            } else {
                return {
                    errors: [
                        {
                            path: "changePassword",
                            message: "CommunityGarden Map 1: Error 4"
                        }
                    ],
                };
            }
        }
    }

    @Mutation(() => DeleteAccountResponse)
    async deleteAccount(
        @Arg("input") input: DualCredential,
        @Ctx() { req, res }: LocalFood
    ): Promise<DeleteAccountResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "deleteAccount",
                        message: "CommunityGarden Map 1: Error 1"
                    }
                ],
            };
        }
        const resp: DeleteAccountResponse = await GraphShape1.DeleteAccount(input, req.session.publicId);

        if (resp.errors) {
            return { errors: resp.errors }
        }

        if (resp.deleted == true) {
            return new Promise(yay => req.session.destroy(err => {
                res.clearCookie(process.env.COOKIE_NAME as string);
                if (err) {
                    console.log(`ERROR, \'deleteAccount\' req.session.destroy error: ${err}`);
                    yay({ deleted: false });
                    return;
                }
                yay({ deleted: true });
            }));
        } else {
            return {
                errors: [
                    {
                        path: "deleteAccount",
                        message: "CommunityGarden Map 1: Error 2"
                    }
                ],
            };
        }
    }

    @Mutation(() => AccountResponse)
    async deleteFarm(
        @Arg("input") input: DualCredential,
        @Ctx() { req }: LocalFood
    ): Promise<AccountResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "deleteFarm",
                        message: "CommunityGarden Map 1: Error 1"
                    }
                ],
            };
        }
        if (!req.session.farmId) {
            return {
                errors: [
                    {
                        path: "deleteAccount",
                        message: "CommunityGarden Map 1: Error 2"
                    }
                ],
            };
        }
        const resp: AccountResponse = await GraphShape1.DeleteFarm(input, req.session.publicId, req.session.farmId);

        if (resp.errors) {
            return resp;
        }

        if (resp.account) {
            console.log("Community Garden server... deleteFarm, success...", resp.account.account_type, resp.account.username)
            return resp;
        }
        else {
            return {
                errors: [
                    {
                        path: "deleteFarm",
                        message: "Community Garden Map 1: Error 3"
                    }
                ],
            };
        }
    }

    @Query(() => [Account])
    async accounts(): Promise<Account[]> {
        return Account.find()
    }

    /*
    @Query(() => PublicResponse)
    async account(
        @Arg("username") username: string,
        //@Ctx() { req }: LocalFood,
    ): Promise<PublicResponse> {
        if (!req.session.publicId) {
            return {
                errors: [
                    {
                        path: "account",
                        message: "No publicId on cookie"
                    }
                ]
            };
        }
        const account = await Account.findOne({ where: { username } });
        return { account };
    }*/

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