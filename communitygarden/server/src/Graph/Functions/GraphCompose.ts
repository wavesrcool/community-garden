import "reflect-metadata";
import { toRadians, EARTH_RADIUS } from "spherical-geometry-js";
import { createQueryBuilder, getConnection, getManager } from "typeorm";

import { AccountType } from "../Topology/Figures/EnumTypes";
import { DualCredential, SignUpPublicInput, SignUpFarmInput, UpdateAccountEmailInput, UpdateAccountIdentityInput, UpdateFarmIdentityInput, VegetableCreateInput, QuantityMapCreateInput, ListAddInput, UpdateAccountGeocodeInput } from "../Topology/Figures/InputTypes";
import { GraphResponse, ListResponse, PublicResponse, SignUpResponse, VegetableResponse } from "../Topology/Figures/ObjectTypes";
import argon2 from "argon2";
import { Account } from "../Topology/Atlas/Account";
import { Vegetable } from "../Topology/Atlas/Vegetable";
import { QuantityMap } from "../Topology/Atlas/QuantityMap";
import { List } from "../Topology/Atlas/List";
import { Geocode } from "../Topology/Atlas/Geocode";
import CommunityGarden from "../../../src/CommunityGarden/core";
import { Farm } from "../Topology/Atlas/Farm";

const GraphCompose = {
    SignUpPublic: async (data: SignUpPublicInput): Promise<SignUpResponse> => {
        try {
            const create_account = await getConnection()
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
                    })
                .output(["id", "cg", "username"])
                .execute();
            const raw_account: Account = create_account.raw[0];
            //console.log("r", raw_account)

            const lat_r = toRadians(data.geocode.lat);
            const lng_r = toRadians(data.geocode.lng);
            const ar = await CommunityGarden.angular_radius();
            const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));
            const lat_min = lat_r - ar;
            const lng_min = lng_r - delta_lon;
            const lat_max = lat_r + ar;
            const lng_max = lng_r + delta_lon;

            const create_geocode = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Geocode)
                .values(
                    {
                        lat: data.geocode.lat,
                        lng: data.geocode.lng,
                        lat_r,
                        lng_r,
                        lat_min,
                        lat_max,
                        lng_min,
                        lng_max,
                        ar,
                        delta_lon,

                    })
                .returning('id')
                .execute();
            const raw_geocode: Geocode = create_geocode.raw[0];

            await getConnection()
                .createQueryBuilder()
                .relation(Account, "geocode")
                .of(raw_account.id)
                .set(raw_geocode.id)

            await getConnection()
                .createQueryBuilder()
                .relation(Geocode, "account")
                .of(raw_geocode.id)
                .set(raw_account.id)

            const db_account = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.geocode", "geocode")
                .where("account.username = :username", { username: data.username })
                .getOne()

            if (!db_account || !db_account.geocode) {
                return {
                    errors: [
                        {
                            path: "SignUpPublic",
                            message: `Fatal error: ${data.username}`
                        }
                    ]
                };
            }

            return {
                username: raw_account.username,
                account: raw_account.cg
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

    SignUpFarm: async (data: SignUpFarmInput): Promise<SignUpResponse> => {
        try {
            const lat_r = toRadians(data.geocode.lat);
            const lng_r = toRadians(data.geocode.lng);
            const ar = (Math.max.apply(Math, data.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
            const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));
            const lat_min = lat_r - ar;
            const lat_max = lat_r + ar;
            const lng_min = lng_r - delta_lon;
            const lng_max = lng_r + delta_lon;

            const create_account = await
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
                        })
                    .returning(['id', 'username', 'cg'])
                    .execute();
            const raw_account: Account = create_account.raw[0];

            const create_geocode = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Geocode)
                .values(
                    {
                        lat: data.geocode.lat,
                        lng: data.geocode.lng,
                        lat_r,
                        lng_r,
                        lat_min,
                        lat_max,
                        lng_min,
                        lng_max,
                        ar,
                        delta_lon,
                    })
                .returning('*')
                .execute();
            const raw_geocode: Geocode = create_geocode.raw[0];

            await getConnection()
                .createQueryBuilder()
                .relation(Account, "geocode")
                .of(raw_account.id)
                .set(raw_geocode.id)

            await getConnection()
                .createQueryBuilder()
                .relation(Geocode, "account")
                .of(raw_geocode.id)
                .set(raw_account.id)

            const create_farm = await
                getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Farm)
                    .values(
                        {
                            farm_name: data.farm_name,
                            delivery_gradient: data.delivery_gradient,
                            approves_pickup: data.approves_pickup,
                        })
                    .returning(['*'])
                    .execute();
            const raw_farm = create_farm.raw[0];

            await getConnection()
                .createQueryBuilder()
                .relation(Account, "farm")
                .of(raw_account.id)
                .set(raw_farm.id)

            await getConnection()
                .createQueryBuilder()
                .relation(Farm, "account")
                .of(raw_farm.id)
                .set(raw_account.id)

            //console.log("raw_account", raw_account);
            //console.log("raw_farm", raw_farm)

            const db_account = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.geocode", "geocode")
                .leftJoinAndSelect("account.farm", "farm")
                .where("account.username = :username", { username: data.username })
                .getOne()

            if (!db_account || !db_account.farm || !db_account.geocode) {
                return {
                    errors: [
                        {
                            path: "SignUpPublic",
                            message: `Fatal error: ${data.username}`
                        }
                    ]
                };
            }

            return {
                username: raw_account.username,
                account: raw_account.cg,
                farm: raw_farm.cg
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

    LoginAccount: async (data: DualCredential): Promise<PublicResponse> => {
        const account = await getManager()
            .createQueryBuilder(Account, "account")
            .where("account.username = :username", { username: data.username })
            .leftJoinAndSelect("account.farm", "farm")
            .leftJoinAndSelect("account.geocode", "geocode")
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

        if (!(account.username == data.username)) {
            return {
                errors: [
                    {
                        path: "LoginAccount",
                        message: "The login credentials are not valid"
                    }
                ],
            }
        }

        const valid_password = await argon2.verify(account.password, data.password)
        if (!valid_password) {
            return {
                errors: [
                    {
                        path: "LoginAccount",
                        message: "Invalid login attempt"
                    }
                ],
            }
        }

        return { account };
    },

    DeleteAccount: async (data: DualCredential, publicId: string): Promise<GraphResponse> => {
        try {
            const account = await getManager()
                .createQueryBuilder(Account, "account")
                .where("account.username = :username", { username: data.username })
                .getOne();

            if (!account) {
                return {
                    deleted: false,
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: `There is no account with username: ${data.username}`
                        }
                    ],
                }
            };

            if (!(account.cg == publicId)) {
                return {
                    deleted: false,
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: `UUID incompatibility: ${data.username}`
                        }
                    ],
                }
            };

            const valid = await argon2.verify(account.password, data.password)

            if (!valid) {
                return {
                    deleted: false,
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: `Invalid attempt ${account.username}`
                        }
                    ],
                };
            }


            const deleted_account = await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Account)
                .where("id = :id", { id: account.id })
                .returning('*')
                .execute();

            if (deleted_account.raw[0].username == data.username) {
                return { deleted: true }
            }

            return {
                deleted: false,
                errors: [
                    {
                        path: "DeleteAccount",
                        message: `Fatal error: ${data.username}`
                    }
                ],
            };
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

    DeleteFarm: async (data: DualCredential, publicId: string, farmId: string): Promise<GraphResponse> => {
        try {
            const account = await getManager()
                .createQueryBuilder(Account, "account")
                .where("account.username = :username", { username: data.username })
                .leftJoinAndSelect("account.farm", "farm")
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

            if (!(account.cg == publicId)) {
                return {
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: `UUID account incompatibility: ${data.username}`
                        }
                    ],
                }
            };

            if (!account.farm) {
                return {
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: `There is no farm with username: ${data.username}`
                        }
                    ],
                }
            };

            if (!(account.farm.cg == farmId)) {
                return {
                    errors: [
                        {
                            path: "DeleteAccount",
                            message: `UUID farm incompatibility: ${data.username}`
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

            //unset the relation
            await getConnection()
                .createQueryBuilder()
                .relation(Account, "farm")
                .of(account.id)
                .set(null);


            const deleted_farm = await getConnection()
                .createQueryBuilder()
                .delete()
                .from(Farm)
                .where("cg = :cg", { cg: farmId })
                .returning('*')
                .execute();

            console.log(deleted_farm)

            //modify account to be type PUBLIC
            await getConnection()
                .createQueryBuilder()
                .update(Account)
                .set({ account_type: AccountType.PUBLIC })
                .where("id = :id", { id: account.id })
                .execute();

            return { deleted: true }

            /*
            if (deleted_farm.raw[0].username == data.username) {
                
            }

            return {
                errors: [
                    {
                        path: "DeleteAccount",
                        message: `Fatal error: ${data.username}`
                    }
                ],
            };*/
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

    UpdateAccountIdentity: async (data: UpdateAccountIdentityInput, publicId: string): Promise<PublicResponse> => {
        const update = await getConnection()
            .createQueryBuilder()
            .update(Account)
            .set(
                {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    birth_date: data.birth_date,
                })
            .where("cg = :cg", { cg: publicId })
            .returning('*')
            .execute();
        console.log("UpdateAccountIdentity ", update);
        return { account: update.raw[0] };
    },

    UpdateAccountEmail: async (data: UpdateAccountEmailInput, publicId: string): Promise<PublicResponse> => {
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
                ]
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
            .where("cg = :cg", { cg: publicId })
            .returning('*')
            .execute();
        console.log("UpdateAccountEmail ", update);

        //trigger new confirm email link
        return { account: update.raw[0] };

    },

    UpdateAccountGeocode: async (data: UpdateAccountGeocodeInput, publicId: string): Promise<GraphResponse> => {
        const lat_r = toRadians(data.geocode.lat);
        const lng_r = toRadians(data.geocode.lng);
        const ar = await CommunityGarden.angular_radius();
        const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));
        const lat_min = lat_r - ar;
        const lng_min = lng_r - delta_lon;
        const lat_max = lat_r + ar;
        const lng_max = lng_r + delta_lon;

        const account_is = await createQueryBuilder(Account, "account")
            .leftJoinAndSelect("account.geocode", "geocode")
            .where("account.cg = :cg", { cg: publicId })
            .getOne()

        if (!account_is) {
            return {
                errors: [
                    {
                        path: "UpdateAccountGeocode",
                        message: `No account with geocode publicId: ${publicId}`
                    }
                ]
            }
        }

        await getConnection()
            .createQueryBuilder()
            .update(Geocode)
            .set(
                {
                    lat: data.geocode.lat,
                    lng: data.geocode.lng,
                    lat_r,
                    lng_r,
                    lat_min,
                    lat_max,
                    lng_min,
                    lng_max,
                    ar,
                    delta_lon,
                })
            .where("id = :id", { id: account_is.geocode.id })
            .returning('*')
            .execute();

        const geocode = await createQueryBuilder(Geocode, "geocode")
            .where("geocode.id = :id", { id: account_is.id })
            .getOne()
        console.log("updated geocode...", geocode)

        return { geocode };
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
    /*
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
                const ar = (Math.max.apply(Math, farm.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
                const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));

                const lat_min = lat_r - ar;
                const lat_max = lat_r + ar;

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
                            ar,
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
            const ar = (Math.max.apply(Math, data.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
            const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));

            const lat_min = lat_r - ar;
            const lat_max = lat_r + ar;

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
                        ar,
                    })
                .where("cg = :cg", { cg })
                .returning('*')
                .execute();
            console.log("UpdateFarmGeocode ", update);
            return { account: update.raw[0] };
        }
    },*/

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
        farmId: number,
    ): Promise<VegetableResponse> => {
        try {
            const create_vegetable = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Vegetable)
                .values(
                    {
                        name: data.name,
                        other_name: data.other_name,
                        variety: data.variety,
                        state: data.state,
                    }
                )
                .returning('*')
                .execute();

            const vegetable: Vegetable = create_vegetable.raw[0];
            console.log("vegetable", vegetable)

            await getConnection()
                .createQueryBuilder()
                .relation(Vegetable, "farm")
                .of(vegetable.id)
                .set(farmId)

            return { vegetable: await Vegetable.findOne({ where: { id: vegetable.id } }) };
        }

        catch (err) {
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

    CreateVegetableQuantityMap: async (
        data: QuantityMapCreateInput,
    ): Promise<VegetableResponse> => {
        try {
            const create_quantity_map = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(QuantityMap)
                .values(
                    {
                        available: data.available,
                        mass: data.mass,
                        mass_unit: data.mass_unit,
                        tag: data.tag,
                        valuation: data.valuation,
                        currency: data.currency
                    }
                )
                .returning('*')
                .execute();

            const quantity_map = create_quantity_map.raw[0];
            //console.log("new quantity_map...", quantity_map)

            await getConnection()
                .createQueryBuilder()
                .relation(Vegetable, "map")
                .of(data.vegetable_id)
                .add(quantity_map.id)

            await getConnection()
                .createQueryBuilder()
                .relation(QuantityMap, "vegetable")
                .of(quantity_map.id)
                .set(data.vegetable_id)

            //console.log("quantity_map db..", await QuantityMap.findOne({ where: { id: new_quantity_map.id } }))
            //console.log("vegetable db...", await Vegetable.findOne({ where: { id: data.vegetable_id } }))

            return {
                vegetable: await createQueryBuilder(Vegetable, "vegetable")
                    .leftJoinAndSelect("vegetable.map", "quantity_map")
                    .where("vegetable.id = :id", { id: data.vegetable_id })
                    .getOne(),
            };
        } catch (err) {
            console.log(err)
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

    ListAdd: async (
        data: ListAddInput,
        farmCg: string
    ): Promise<ListResponse | undefined> => {
        try {

            const vegetable = await Vegetable.findOne({ where: { cg: data.node } })
            console.log(vegetable)

            const list_add = await
                getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(List)
                    .values(
                        {
                            from: farmCg,
                            to: data.to,


                        })
                    .returning('*')
                    .execute();


            const list: List = list_add.raw[0];
            return { list };
        } catch (err) {
            console.log(err)
            return {
                errors: [
                    {
                        path: `${err.severity}, ${err.code}`,
                        message: `${err.detail}`
                    }
                ],
            }
        }

    }
}

export default GraphCompose;