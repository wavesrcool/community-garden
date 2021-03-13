import argon2 from "argon2";
import { createQueryBuilder, getConnection } from "typeorm";
import { Account } from "../Topology/Atlas/Account";
import { DualCredential, SignUpFarmInput, SignUpPublicInput, UniquesCredential } from "../Topology/Figures/InputTypes";
import { AccountResponse, DeleteAccountResponse, PublicResponse, SignUpResponse } from "../Topology/Figures/ObjectTypes";
import { AccountType } from "../Topology/Figures/EnumTypes";
import { Geocode } from "../Topology/Atlas/Geocode";
import { EARTH_RADIUS, toRadians } from "spherical-geometry-js";
import { Geodesic } from "../Topology/Atlas/Geodesic";
import { Farm } from "../Topology/Atlas/Farm";

const GraphShape1 = {
    SignUpPublic: async (data: SignUpPublicInput): Promise<SignUpResponse> => {
        try {
            const create_account = await createQueryBuilder()
                .insert()
                .into(Account)
                .values(
                    {
                        account_type: AccountType.PUBLIC,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        birth_date: data.birth_date,
                        email: data.email,
                        username: data.username,
                        password: await argon2.hash(data.password),
                    })
                .output(["id", "cg", "username"])
                .execute();
            const raw_account: Account = create_account.raw[0];

            const create_geocode = await createQueryBuilder()
                .insert()
                .into(Geocode)
                .values(
                    {
                        lat: data.geocode.lat,
                        lng: data.geocode.lng,
                    })
                .returning('id')
                .execute();
            const raw_geocode: Geocode = create_geocode.raw[0];

            await createQueryBuilder()
                .relation(Account, "geocode")
                .of(raw_account.id)
                .set(raw_geocode.id)

            await createQueryBuilder()
                .relation(Geocode, "account")
                .of(raw_geocode.id)
                .set(raw_account.id)

            const acct = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.geocode", "geocode")
                .where("account.username = :username", { username: data.username })
                .getOne()

            if (!acct || !acct.geocode) {
                return {
                    errors: [
                        {
                            path: "SignUpPublic",
                            message: "GraphShape: Error 1"
                        }
                    ]
                };
            }

            if (!(acct.username == data.username)) {
                return {
                    errors: [
                        {
                            path: "SignUpPublic",
                            message: "GraphShape: Error 2"
                        }
                    ]
                };
            }

            return {
                username: acct.username,
                account: acct.cg,
                account_type: acct.account_type
            };
        } catch (err) {
            return {
                errors: [
                    {
                        path: "SignUpPublic",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    SignUpFarm: async (data: SignUpFarmInput): Promise<SignUpResponse> => {
        try {
            const create_account = await createQueryBuilder()
                .insert()
                .into(Account)
                .values(
                    {
                        account_type: AccountType.FARM,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        birth_date: data.birth_date,
                        email: data.email,
                        username: data.username,
                        password: await argon2.hash(data.password),
                    })
                .returning('id')
                .execute();
            const raw_account_id: number = create_account.raw[0].id;

            const create_geocode = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Geocode)
                .values(
                    {
                        lat: data.geocode.lat,
                        lng: data.geocode.lng,

                    })
                .returning('id')
                .execute();
            const raw_geocode_id: number = create_geocode.raw[0].id;

            await createQueryBuilder()
                .relation(Account, "geocode")
                .of(raw_account_id)
                .set(raw_geocode_id)

            await createQueryBuilder()
                .relation(Geocode, "account")
                .of(raw_geocode_id)
                .set(raw_account_id)

            const create_farm = await createQueryBuilder()
                .insert()
                .into(Farm)
                .values(
                    {
                        farm_name: data.farm_name,
                        approves_pickup: data.approves_pickup,
                    })
                .returning('id')
                .execute();
            const raw_farm_id: number = create_farm.raw[0].id;

            await getConnection()
                .createQueryBuilder()
                .relation(Account, "farm")
                .of(raw_account_id)
                .set(raw_farm_id)

            await getConnection()
                .createQueryBuilder()
                .relation(Farm, "account")
                .of(raw_farm_id)
                .set(raw_account_id)

            const lat_r = toRadians(data.geocode.lat);
            const lng_r = toRadians(data.geocode.lng);
            // get the largest radius value from delivery_gradient and use to compute ar
            const ar = (Math.max.apply(Math, data.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
            const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));
            const lat_min = lat_r - ar;
            const lat_max = lat_r + ar;
            const lng_min = lng_r - delta_lon;
            const lng_max = lng_r + delta_lon;

            const create_geodesic = await createQueryBuilder()
                .insert()
                .into(Geodesic)
                .values(
                    {
                        lat_r,
                        lng_r,
                        lat_min,
                        lat_max,
                        lng_min,
                        lng_max,
                        ar,
                        delta_lon,
                        delivery_gradient: data.delivery_gradient
                    })
                .returning('id')
                .execute();
            const raw_geodesic_id: number = create_geodesic.raw[0].id;

            await createQueryBuilder()
                .relation(Farm, "geodesic")
                .of(raw_farm_id)
                .set(raw_geodesic_id)

            await createQueryBuilder()
                .relation(Geodesic, "farm")
                .of(raw_geodesic_id)
                .set(raw_farm_id)

            const acct = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.geocode", "geocode")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("farm.geodesic", "geodesic")
                .where("account.username = :username", { username: data.username })
                .getOne()

            if (!acct || !acct.farm || !acct.geocode || !acct.farm.geodesic) {
                return {
                    errors: [
                        {
                            path: "SignUpFarm",
                            message: "GraphShape: Error 1"
                        }
                    ]
                };
            }

            if (!(acct.username == data.username)) {
                return {
                    errors: [
                        {
                            path: "SignUpFarm",
                            message: "GraphShape: Error 2"
                        }
                    ]
                };
            }

            return {
                username: acct.username,
                account: acct.cg,
                account_type: acct.account_type
            };
        } catch (err) {
            return {
                errors: [
                    {
                        path: "SignUpFarm",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    LoginAccount: async (data: DualCredential): Promise<AccountResponse> => {
        try {
            const acct = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .leftJoinAndSelect("farm.geodesic", "geodesic")
                .where("account.username = :username", { username: data.username })
                .getOne();

            if (!acct) {
                return {
                    errors: [
                        {
                            path: "LoginAccount",
                            message: "GraphShape: Error 1"
                        }
                    ]
                };
            }

            if (!(acct.username == data.username)) {
                return {
                    errors: [
                        {
                            path: "LoginAccount",
                            message: "GraphShape: Error 2"
                        }
                    ]
                };
            }

            const valid_password = await argon2.verify(acct.password, data.password)
            if (!valid_password) {
                return {
                    errors: [
                        {
                            path: "LoginAccount",
                            message: "GraphShape: Error 3"
                        }
                    ]
                };
            }

            return { account: acct };

        } catch (err) {
            return {
                errors: [
                    {
                        path: "LoginAccount",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    ForgotPassword: async (input: UniquesCredential): Promise<PublicResponse> => {
        const acct = await createQueryBuilder(Account, "account")
            .where("account.email = :email", { email: input.email })
            .andWhere("account.username = :username", { username: input.username })
            .getOne();

        if (!acct || !(acct.username == input.username) || !(acct.email == input.email)) {
            return {
                errors: [
                    {
                        path: "ForgotPassword",
                        message: `GraphShape: Error 1`
                    }
                ],
            };
        }

        return { communitygarden: acct.cg }
    },

    DeleteAccount: async (data: DualCredential, publicId: string): Promise<DeleteAccountResponse> => {
        try {
            const account_is = await createQueryBuilder(Account, "account")
                .where("account.username = :username", { username: data.username })
                .andWhere("account.cg = :cg", { cg: publicId })
                .getOne();

            if (!account_is) {
                return {
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: "GraphShape: Error 1"
                        }
                    ]
                };
            };

            const valid_password = await argon2.verify(account_is.password, data.password)

            if (!valid_password) {
                return {
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: "GraphShape: Error 2"
                        }
                    ]
                };
            }

            const deleted_account = await createQueryBuilder()
                .delete()
                .from(Account)
                .where("id = :id", { id: account_is.id })
                .returning('cg')
                .execute();
            const deleted_account_cg: string = deleted_account.raw[0].cg;

            if (deleted_account_cg == publicId) {
                return { deleted: true };
            }

            else {
                return {
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: "GraphShape: Error 4"
                        }
                    ]
                };
            }
        } catch (err) {
            return {
                errors: [
                    {
                        path: "DeleteAccount",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    DeleteFarm: async (data: DualCredential, publicId: string, farmId: string): Promise<AccountResponse> => {
        try {
            const account_is = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .where("account.username = :username", { username: data.username })
                .andWhere("account.cg = :cg", { cg: publicId })
                .getOne();

            if (!account_is || !account_is.farm) {
                return {
                    errors: [
                        {
                            path: "DeleteFarm",
                            message: "GraphShape: Error 1"
                        }
                    ]
                };
            };

            const valid_password = await argon2.verify(account_is.password, data.password)

            if (!valid_password) {
                return {
                    errors: [
                        {
                            path: "DeleteFarm",
                            message: "GraphShape: Error 2"
                        }
                    ]
                };
            }

            //unset the relation
            await createQueryBuilder()
                .relation(Account, "farm")
                .of(account_is.id)
                .set(null);

            const deleted_farm = await createQueryBuilder()
                .delete()
                .from(Farm)
                .where("cg = :cg", { cg: farmId })
                .returning('id')
                .execute();

            const deleted_farm_id: number = deleted_farm.raw[0].id;

            if (deleted_farm_id == account_is.farm.id) {
                //modify account to be type PUBLIC
                const updated_account = await createQueryBuilder()
                    .update(Account)
                    .set(
                        {
                            account_type: AccountType.PUBLIC
                        })
                    .where("cg = :cg", { cg: publicId })
                    .andWhere("id = :id", { id: account_is.id })
                    .returning('id')
                    .execute();
                const updated_account_id: number = updated_account.raw[0].id;

                const acct = await createQueryBuilder(Account, "account")
                    .leftJoinAndSelect("account.geocode", "geocode")
                    .leftJoinAndSelect("account.farm", "farm")
                    .where("account.id = :id", { id: updated_account_id })
                    .andWhere("account.account_type = :account_type", { account_type: AccountType.PUBLIC })
                    .getOne()

                if (acct) {
                    //send email
                    return { account: acct };
                } else {
                    return {
                        errors: [
                            {
                                path: "DeleteFarm",
                                message: "GraphShape: Error 3"
                            }
                        ]
                    };
                }
            } else {
                return {
                    errors: [
                        {
                            path: "DeleteFarm",
                            message: "GraphShape: Error 4"
                        }
                    ]
                };
            }
        } catch (err) {
            console.log(err)
            return {
                errors: [
                    {
                        path: "DeleteFarm",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },
};

export default GraphShape1;