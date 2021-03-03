import "reflect-metadata";
import { toRadians, EARTH_RADIUS } from "spherical-geometry-js";
import { getConnection, getManager } from "typeorm";

import { AccountType } from "../../Topology/Figures/EnumTypes";
import { DeleteAccountInput, LoginInput, SignUpAccountInput, SignUpFarmInput, UpdateAccountEmailInput, UpdateAccountGeocodeInput, UpdateAccountIdentityInput, UpdateFarmGeocodeInput, UpdateFarmIdentityInput, VegetableCreateInput } from "../../Topology/Figures/InputTypes";
import { BotanicalVegetable, PublicResponse, VegetableResponse } from "../../Topology/Figures/ObjectTypes";
import argon2 from "argon2";
import { Account } from "../../Topology/Atlas/Account";
import { Farm } from "../../Topology/Atlas/Farm";
import { Vegetable } from "../../Topology/Atlas/Vegetable";



const GraphCompose = {
    SignUpFarm: async (data: SignUpFarmInput): Promise<PublicResponse> => {
        try {
            const lat_r = toRadians(data.geocode.geolocation.lat);
            const lng_r = toRadians(data.geocode.geolocation.lng);

            const angular_r = (Math.max.apply(Math, data.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
            const delta_lon = Math.asin((Math.sin(angular_r)) / (Math.cos(lat_r)));

            const lat_min = lat_r - angular_r;
            const lat_max = lat_r + angular_r;

            const lng_min = lng_r - delta_lon;
            const lng_max = lng_r + delta_lon;

            const create_farm = await
                getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Farm)
                    .values(
                        {
                            farm_name: data.farm_name,
                            geocode: data.geocode,
                            delivery_gradient: data.delivery_gradient,
                            lat_r,
                            lng_r,
                            lat_min,
                            lat_max,
                            lng_min,
                            lng_max,
                            angular_r: angular_r,

                        })
                    .returning('*')
                    .execute();
            const new_farm: Farm = create_farm.raw[0];

            const create_account_farm = await
                getConnection()
                    .createQueryBuilder()
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
                            geocode: data.geocode,
                            farm: new_farm,
                        })
                    .returning('*')
                    .execute();

            const new_account: Account = create_account_farm.raw[0];

            const updated_farm = await getConnection()
                .createQueryBuilder()
                .update(Farm)
                .set({ accountId: new_account.id })
                .where("id = :id", { id: new_farm.id })
                .returning('*')
                .execute();
            return {
                account: new_account,
                farm: updated_farm.raw[0]
            };
        } catch (err) {
            return {
                errors: [
                    {
                        path: `${err.severity}, ${err.code}`,
                        message: `${err.detail}`
                    }
                ],
            };
        }
    },

    SignUpPublic: async (data: SignUpAccountInput): Promise<PublicResponse> => {
        try {
            const create_account = await
                getConnection()
                    .createQueryBuilder()
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
                            geocode: data.geocode,
                        })
                    .returning('*')
                    .execute();

            const account: Account = create_account.raw[0];
            return { account };
        } catch (err) {
            return {
                errors: [
                    {
                        path: `${err.severity}, ${err.code}`,
                        message: `${err.detail}`
                    }
                ],
            };
        }
    },

    LoginAccount: async (data: LoginInput): Promise<PublicResponse> => {
        const account = await getManager()
            .createQueryBuilder(Account, "account")
            .where("account.username = :username", { username: data.username })
            .leftJoinAndSelect("account.farm", "farm")
            .getOne();

        if (!account) {
            return {
                errors: [
                    {
                        path: "LoginAccount",
                        message: `There is no account with username: ${data.username}`
                    }
                ],
            }
        }

        const valid = await argon2.verify(account.password, data.password)
        if (!valid) {
            return {
                errors: [
                    {
                        path: "LoginAccount",
                        message: "The login credentials are not valid"
                    }
                ],
            }
        }

        return { account };
    },

    DeleteAccount: async (data: DeleteAccountInput): Promise<PublicResponse> => {
        const account = await getManager()
            .createQueryBuilder(Account, "account")
            .where("account.username = :username", { username: data.username })
            .getOne();

        if (!account) {
            return {
                errors: [
                    {
                        path: "DeleteAccount",
                        message: `There is no account with username: ${data.username}`
                    }
                ],
            }
        };

        const valid = await argon2.verify(account.password, data.password)

        if (!valid) {
            return {
                errors: [
                    {
                        path: "DeleteAccount",
                        message: `Incorrect password for ${account.username}`
                    }
                ],
            };
        }

        try {
            const public_acct = await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Account)
                .where("id = :id", { id: account.id })
                .returning('*')
                .execute();

            console.log(public_acct)

            return { deleted: true }
        } catch (err) {
            return {
                errors: [
                    {
                        path: `DeleteAccount, ${err.severity}`,
                        message: `${err.code}, ${err.detail}`
                    }
                ],
            };
        }
    },

    UpdateAccountIdentity: async (data: UpdateAccountIdentityInput, cg: string): Promise<PublicResponse> => {
        const update = await getConnection()
            .createQueryBuilder()
            .update(Account)
            .set(
                {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    birth_date: data.birth_date,
                })
            .where("cg = :cg", { cg })
            .returning('*')
            .execute();
        console.log("UpdateAccountIdentity ", update);
        return { account: update.raw[0] };
    },

    UpdateAccountEmail: async (data: UpdateAccountEmailInput, cg: string): Promise<PublicResponse> => {
        const email_exists = await getManager()
            .createQueryBuilder(Account, "account")
            .where("account.email = :email", { email: data.email })
            .getOne();

        if (email_exists) {
            return {
                errors: [
                    {
                        path: "UpdateAccountEmail",
                        message: `This email is in use: ${data.email}`
                    }
                ],
            }
        }

        const update = await getConnection()
            .createQueryBuilder()
            .update(Account)
            .set(
                {
                    email: data.email,
                    verified_email: false,
                })
            .where("cg = :cg", { cg })
            .returning('*')
            .execute();
        console.log("UpdateAccountEmail ", update);

        //trigger new confirm email link
        return { account: update.raw[0] };
    },

    UpdateAccountGeocode: async (data: UpdateAccountGeocodeInput, cg: string): Promise<PublicResponse> => {
        const update = await getConnection()
            .createQueryBuilder()
            .update(Account)
            .set(
                {
                    geocode: data.geocode
                })
            .where("cg = :cg", { cg })
            .returning('*')
            .execute();
        console.log("UpdateAccountGeocode ", update);
        return { account: update.raw[0] };
    },

    UpdateFarmIdentity: async (data: UpdateFarmIdentityInput, cg: string): Promise<PublicResponse> => {
        const update = await getConnection()
            .createQueryBuilder()
            .update(Farm)
            .set(
                {
                    farm_name: data.farm_name,
                })
            .where("cg = :cg", { cg })
            .returning('*')
            .execute();
        console.log("UpdateFarmIdentity ", update);
        return { account: update.raw[0] };
    },

    UpdateFarmGeocode: async (data: UpdateFarmGeocodeInput, cg: string): Promise<PublicResponse> => {
        const lat_r = toRadians(data.geocode.geolocation.lat);
        const lng_r = toRadians(data.geocode.geolocation.lng);

        if (!data.delivery_gradient) {
            const farm = await getConnection()
                .createQueryBuilder()
                .select("farm")
                .from(Farm, "farm")
                .where("farm.cg = :cg", { cg })
                .getOne();

            if (farm) {
                // use existing delivery gradient
                const angular_r = (Math.max.apply(Math, farm.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
                const delta_lon = Math.asin((Math.sin(angular_r)) / (Math.cos(lat_r)));

                const lat_min = lat_r - angular_r;
                const lat_max = lat_r + angular_r;

                const lng_min = lng_r - delta_lon;
                const lng_max = lng_r + delta_lon;

                const update = await getConnection()
                    .createQueryBuilder()
                    .update(Farm)
                    .set(
                        {
                            geocode: data.geocode,
                            lat_r,
                            lng_r,
                            lat_min,
                            lat_max,
                            lng_min,
                            lng_max,
                            angular_r,
                        })
                    .where("cg = :cg", { cg })
                    .returning('*')
                    .execute();
                console.log("UpdateFarmGeocode ", update);
                return { account: update.raw[0] };
            } else {
                return {
                    errors: [
                        {
                            path: "updateFarmGeocode",
                            message: `Farm not found with cg: ${cg}`
                        }
                    ]
                };
            }
        } else {
            const angular_r = (Math.max.apply(Math, data.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
            const delta_lon = Math.asin((Math.sin(angular_r)) / (Math.cos(lat_r)));

            const lat_min = lat_r - angular_r;
            const lat_max = lat_r + angular_r;

            const lng_min = lng_r - delta_lon;
            const lng_max = lng_r + delta_lon;

            const update = await getConnection()
                .createQueryBuilder()
                .update(Farm)
                .set(
                    {
                        delivery_gradient: data.delivery_gradient,
                        geocode: data.geocode,
                        lat_r,
                        lng_r,
                        lat_min,
                        lat_max,
                        lng_min,
                        lng_max,
                        angular_r,
                    })
                .where("cg = :cg", { cg })
                .returning('*')
                .execute();
            console.log("UpdateFarmGeocode ", update);
            return { account: update.raw[0] };
        }
    },

    ForgotPassword: async (email: string): Promise<PublicResponse> => {
        const account = await await getConnection()
            .createQueryBuilder()
            .select("account")
            .from(Account, "account")
            .where("account.email = :email", { email })
            .getOne();
        if (!account) {
            return {
                // @todo Change this to null because prevents finding registered users by induction
                errors: [
                    {
                        path: "ForgotPassword",
                        message: `Account not found with email: ${email}`
                    }
                ]
            };
        }

        return { account }
    },

    CreateVegetable: async (
        data: VegetableCreateInput,
        id: number,
        botanical: BotanicalVegetable,
    ): Promise<VegetableResponse> => {
        try {
            const farm = await getConnection()
                .createQueryBuilder()
                .select("farm")
                .from(Farm, "farm")
                .where("farm.id = :id", { id })
                .getOne();
            console.log(farm);
            if (data.measurements && data.quantities) {
                const m = ((data.measurements.length > 0) ? true : false)
                const q = ((data.quantities.length > 0) ? true : false)

                if (m && q) {
                    const create_account = await getConnection().
                        createQueryBuilder().
                        insert().
                        into(Vegetable).
                        values(
                            {
                                index: data.index,
                                nameCommon: botanical.nameCommon,
                                nameGeneric: botanical.nameGeneric,
                                nameSpecificEpithet: botanical.nameSpecificEpithet,
                                farm,
                                measurements: data.measurements,
                                quantities: data.quantities,

                            }
                        ).
                        returning('*').
                        execute();

                    //console.log("Vegetable, ", create_account.raw[0]);
                    const veg: Vegetable = create_account.raw[0];
                    return { vegetable: veg };
                }
                else if (m && !q) {
                    const create_account = await getConnection().
                        createQueryBuilder().
                        insert().
                        into(Vegetable).
                        values(
                            {
                                index: data.index,
                                nameCommon: botanical.nameCommon,
                                nameGeneric: botanical.nameGeneric,
                                nameSpecificEpithet: botanical.nameSpecificEpithet,
                                farm,
                                measurements: data.measurements,

                            }
                        ).
                        returning('*').
                        execute();

                    //console.log("Vegetable, ", create_account.raw[0]);
                    const veg: Vegetable = create_account.raw[0];
                    return { vegetable: veg };
                }
                else if (q && !m) {
                    const create_account = await getConnection().
                        createQueryBuilder().
                        insert().
                        into(Vegetable).
                        values(
                            {
                                index: data.index,
                                nameCommon: botanical.nameCommon,
                                nameGeneric: botanical.nameGeneric,
                                nameSpecificEpithet: botanical.nameSpecificEpithet,
                                farm,
                                quantities: data.quantities,

                            }
                        ).
                        returning('*').
                        execute();

                    //console.log("Vegetable, ", create_account.raw[0]);
                    const veg: Vegetable = create_account.raw[0];
                    return { vegetable: veg };
                } else {
                    return {
                        errors: [
                            {
                                path: "buildGraph",
                                message: "Measurements and Quantities are both empty lists"
                            }
                        ]
                    };
                };
            }

            else if (data.measurements && (data.quantities == undefined)) {
                const m = ((data.measurements.length > 0) ? true : false);
                if (m) {
                    const create_account = await getConnection().
                        createQueryBuilder().
                        insert().
                        into(Vegetable).
                        values(
                            {
                                index: data.index,
                                nameCommon: botanical.nameCommon,
                                nameGeneric: botanical.nameGeneric,
                                nameSpecificEpithet: botanical.nameSpecificEpithet,
                                farm,
                                measurements: data.measurements,

                            }
                        ).
                        returning('*').
                        execute();

                    //console.log("Vegetable, ", create_account.raw[0]);
                    const veg: Vegetable = create_account.raw[0];
                    return { vegetable: veg };
                } else {
                    return {
                        errors: [
                            {
                                path: "buildVegetable",
                                message: "Measurements is empty list"
                            }
                        ]
                    };
                };
            }

            else if (data.quantities && (data.measurements == undefined)) {
                const q = ((data.quantities.length > 0) ? true : false);
                if (q) {
                    const create_account = await getConnection().
                        createQueryBuilder().
                        insert().
                        into(Vegetable).
                        values(
                            {
                                index: data.index,
                                nameCommon: botanical.nameCommon,
                                nameGeneric: botanical.nameGeneric,
                                nameSpecificEpithet: botanical.nameSpecificEpithet,
                                farm,
                                quantities: data.quantities,

                            }
                        ).
                        returning('*').
                        execute();

                    //console.log("Vegetable, ", create_account.raw[0]);
                    const veg: Vegetable = create_account.raw[0];
                    return { vegetable: veg };
                } else {
                    return {
                        errors: [
                            {
                                path: "buildVegetable",
                                message: "Quantities is empty list"
                            }
                        ]
                    };
                };
            }

            else {
                return {
                    errors: [
                        {
                            path: "buildVegetable",
                            message: "Measurements and Quantities are both undefined"
                        }
                    ]
                }
            }
        } catch (err) {
            return {
                errors: [
                    {
                        path: `${err.severity}, ${err.code}`,
                        message: `${err.detail}`
                    }
                ],
            }
        }
    },
}

export default GraphCompose;