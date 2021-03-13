import { EARTH_RADIUS, toRadians } from "spherical-geometry-js";
import { createQueryBuilder } from "typeorm";
import { Account } from "../Topology/Atlas/Account";
import { Farm } from "../Topology/Atlas/Farm";
import { Geocode } from "../Topology/Atlas/Geocode";
import { Geodesic } from "../Topology/Atlas/Geodesic";
import { AccountType } from "../Topology/Figures/EnumTypes";
import { UpdateAccountEmailInput, UpdateAccountGeocodeInput, UpdateAccountIdentityInput, UpdateFarmDeliveryGradientInput, UpdateFarmIdentityInput } from "../Topology/Figures/InputTypes";
import { AccountResponse } from "../Topology/Figures/ObjectTypes";

const GraphShape2 = {
    UpdateAccountIdentity: async (data: UpdateAccountIdentityInput, publicId: string): Promise<AccountResponse> => {
        try {
            const account_is = await createQueryBuilder(Account, "account")
                .where("account.cg = :cg", { cg: publicId })
                .getOne();

            if (!account_is) {
                return {
                    errors: [
                        {
                            path: "UpdateAccountIdentity",
                            message: "GraphShape: Error 1"
                        }
                    ]
                }
            }
            const updated_account = await createQueryBuilder()
                .update(Account)
                .set(
                    {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        birth_date: data.birth_date,
                    })
                .where("cg = :cg", { cg: publicId })
                .returning('id')
                .execute();

            const updated_account_id: number = updated_account.raw[0].id;

            if (!(updated_account_id == account_is.id)) {
                return {
                    errors: [
                        {
                            path: "UpdateAccountIdentity",
                            message: "GraphShape: Error 2"
                        }
                    ]
                }
            }

            const acct = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .where("account.id = :id", { id: updated_account_id })
                .getOne()

            if (acct) {
                //send email
                return { account: acct };
            } else {
                return {
                    errors: [
                        {
                            path: "UpdateAccountIdentity",
                            message: "GraphShape: Error 2"
                        }
                    ]
                }
            }
        } catch (err) {
            return {
                errors: [
                    {
                        path: "UpdateAccountIdentity",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    UpdateAccountEmail: async (data: UpdateAccountEmailInput, publicId: string): Promise<AccountResponse> => {
        try {
            const email_exists = await createQueryBuilder(Account, "account")
                .where("account.email = :email", { email: data.email })
                .getOne();

            if (email_exists) {
                if (email_exists.cg == publicId) {
                    return {
                        errors: [
                            {
                                path: "UpdateAccountEmail",
                                message: "This is already your email ;)"
                            }
                        ]
                    }
                }
                return {
                    errors: [
                        {
                            path: "UpdateAccountEmail",
                            message: "This email is registered to another account"
                        }
                    ]
                }
            }

            const account_is = await createQueryBuilder(Account, "account")
                .where("account.cg = :cg", { cg: publicId })
                .getOne();

            if (!account_is) {
                return {
                    errors: [
                        {
                            path: "UpdateAccountEmail",
                            message: "GraphShape: Error 2"
                        }
                    ]
                }
            }

            const updated_account = await createQueryBuilder()
                .update(Account)
                .set(
                    {
                        email: data.email,
                        verified_email: false,
                    })
                .where("cg = :cg", { cg: publicId })
                .returning('id')
                .execute();

            const updated_account_id: number = updated_account.raw[0].id;

            if (!(updated_account_id == account_is.id)) {
                return {
                    errors: [
                        {
                            path: "UpdateAccountEmail",
                            message: "GraphShape: Error 3"
                        }
                    ]
                }
            }

            const acct = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .where("account.id = :id", { id: updated_account_id })
                .andWhere("account.cg = :cg", { cg: publicId })
                .getOne()

            if (acct) {
                //send email
                return { account: acct };
            } else {
                return {
                    errors: [
                        {
                            path: "UpdateAccountEmail",
                            message: "GraphShape: Error 4"
                        }
                    ]
                }
            }
        } catch (err) {
            return {
                errors: [
                    {
                        path: "UpdateAccountEmail",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    UpdateAccountGeocode: async (data: UpdateAccountGeocodeInput, publicId: string): Promise<AccountResponse> => {
        try {
            const account_is = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .leftJoinAndSelect("farm.geodesic", "geodesic")
                .where("account.cg = :cg", { cg: publicId })
                .getOne()

            if (!account_is || !account_is.geocode.id) {
                return {
                    errors: [
                        {
                            path: "UpdateAccountGeocode",
                            message: "GraphShape: Error 1"
                        }
                    ]
                }
            }

            const updated_geocode = await createQueryBuilder()
                .update(Geocode)
                .set(
                    {
                        lat: data.geocode.lat,
                        lng: data.geocode.lng,
                    })
                .where("id = :id", { id: account_is.geocode.id })
                .returning('*')
                .execute();

            const updated_geocode_raw: Geocode = updated_geocode.raw[0];

            if (!(updated_geocode_raw.id == account_is.geocode.id)) {
                return {
                    errors: [
                        {
                            path: "UpdateAccountEmail",
                            message: "GraphShape: Error 2"
                        }
                    ]
                }
            }

            switch (account_is.account_type) {
                case AccountType.PUBLIC:
                    const acct_public = await createQueryBuilder(Account, "account")
                        .leftJoinAndSelect("account.farm", "farm")
                        .leftJoinAndSelect("account.geocode", "geocode")
                        .leftJoinAndSelect("farm.geodesic", "geodesic")
                        .where("account.id = :id", { id: account_is.id })
                        .andWhere("geocode.id = :id", { id: updated_geocode_raw.id })
                        .getOne()
                    if (acct_public) {
                        return { account: acct_public };
                    }

                    else {
                        return {
                            errors: [
                                {
                                    path: "UpdateAccountGeocode",
                                    message: "GraphShape: Error 3"
                                }
                            ]
                        }
                    }
                case AccountType.FARM:
                    const lat_r = toRadians(updated_geocode_raw.lat);
                    const lng_r = toRadians(updated_geocode_raw.lng);
                    // get the largest radius value from the geodesic delivery_gradient and use to compute ar
                    const ar = (Math.max.apply(Math, account_is.farm.geodesic.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
                    const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));
                    const lat_min = lat_r - ar;
                    const lat_max = lat_r + ar;
                    const lng_min = lng_r - delta_lon;
                    const lng_max = lng_r + delta_lon;

                    const updated_geodesic = await createQueryBuilder()
                        .update(Geodesic)
                        .set(
                            {
                                lat_r,
                                lng_r,
                                lat_min,
                                lat_max,
                                lng_min,
                                lng_max,
                                ar,
                                delta_lon,
                                //delivery_gradient: data.delivery_gradient
                            })
                        .where("id = :id", { id: account_is.farm.geodesic.id })
                        .returning('id')
                        .execute();

                    const updated_geodesic_id: number = updated_geodesic.raw[0].id;

                    if (!(updated_geodesic_id == account_is.farm.geodesic.id)) {
                        return {
                            errors: [
                                {
                                    path: "UpdateAccountGeocode",
                                    message: "GraphShape: Error 4"
                                }
                            ]
                        }
                    }

                    const acct_farm = await createQueryBuilder(Account, "account")
                        .leftJoinAndSelect("account.farm", "farm")
                        .leftJoinAndSelect("account.geocode", "geocode")
                        .leftJoinAndSelect("farm.geodesic", "geodesic")
                        .where("account.id = :id", { id: account_is.id })
                        .andWhere("geocode.id = :id", { id: updated_geocode_raw.id })
                        .getOne()
                    if (acct_farm) {
                        return { account: acct_farm };
                    }

                    else {
                        return {
                            errors: [
                                {
                                    path: "UpdateAccountGeocode",
                                    message: "GraphShape: Error 5"
                                }
                            ]
                        }
                    }
                default:
                    return {
                        errors: [
                            {
                                path: "UpdateAccountGeocode",
                                message: "GraphShape: Error 6"
                            }
                        ]
                    }
            }
        } catch (err) {
            return {
                errors: [
                    {
                        path: "UpdateAccountGeocode",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    UpdateFarmIdentity: async (data: UpdateFarmIdentityInput, publicId: string, farmId: string): Promise<AccountResponse> => {
        try {
            const account_is = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .where("account.cg = :cg", { cg: publicId })
                .getOne()

            if (!account_is || !account_is.farm || !(account_is.farm.cg == farmId)) {
                return {
                    errors: [
                        {
                            path: "UpdateFarmIdentity",
                            message: "GraphShape: Error 1"
                        }
                    ]
                }
            }

            const updated_farm = await createQueryBuilder()
                .update(Farm)
                .set(
                    {
                        farm_name: data.farm_name,
                        approves_pickup: data.approves_pickup,
                    })
                .where("cg = :cg", { cg: farmId })
                .returning('id')
                .execute();

            const updated_farm_id: number = updated_farm.raw[0].id;

            if (!(updated_farm_id == account_is.farm.id)) {
                return {
                    errors: [
                        {
                            path: "UpdateFarmIdentity",
                            message: "GraphShape: Error 2"
                        }
                    ]
                }
            }

            const acct = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .where("account.id = :id", { id: account_is.id })
                .andWhere("account.cg = :cg", { cg: publicId })
                .getOne()

            if (acct) {
                //send email
                return { account: acct };
            } else {
                return {
                    errors: [
                        {
                            path: "UpdateFarmIdentity",
                            message: "GraphShape: Error 3"
                        }
                    ]
                }
            }
        } catch (err) {
            return {
                errors: [
                    {
                        path: "UpdateFarmIdentity",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    },

    UpdateFarmDeliveryGradient: async (data: UpdateFarmDeliveryGradientInput, publicId: string, farmId: string): Promise<AccountResponse> => {
        try {
            const account_is = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .leftJoinAndSelect("farm.geodesic", "geodesic")
                .where("account.cg = :cg", { cg: publicId })
                .getOne()

            if (!account_is || !account_is.geocode || !account_is.farm || !account_is.farm.geodesic || !(account_is.farm.cg == farmId)) {
                return {
                    errors: [
                        {
                            path: "UpdateFarmDeliveryGradient",
                            message: "GraphShape: Error 1"
                        }
                    ]
                }
            }


            const lat_r = toRadians(account_is.geocode.lat);
            const lng_r = toRadians(account_is.geocode.lng);
            // get the largest radius value from delivery_gradient and use to compute ar
            const ar = (Math.max.apply(Math, data.delivery_gradient.map(function (o) { return o.radius }))) / EARTH_RADIUS * 1000;
            const delta_lon = Math.asin((Math.sin(ar)) / (Math.cos(lat_r)));
            const lat_min = lat_r - ar;
            const lat_max = lat_r + ar;
            const lng_min = lng_r - delta_lon;
            const lng_max = lng_r + delta_lon;

            const updated_geodesic = await createQueryBuilder()
                .update(Geodesic)
                .set(
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
                .where("id = :id", { id: account_is.farm.geodesic.id })
                .returning('id')
                .execute();

            const updated_geodesic_id: number = updated_geodesic.raw[0].id;

            if (!(updated_geodesic_id == account_is.farm.geodesic.id)) {
                return {
                    errors: [
                        {
                            path: "UpdateFarmDeliveryGradient",
                            message: "GraphShape: Error 2"
                        }
                    ]
                }
            }

            const acct = await createQueryBuilder(Account, "account")
                .leftJoinAndSelect("account.farm", "farm")
                .leftJoinAndSelect("account.geocode", "geocode")
                .leftJoinAndSelect("farm.geodesic", "geodesic")
                .where("account.id = :id", { id: account_is.id })
                .getOne()

            if (acct) {
                //send email
                return { account: acct };
            } else {
                return {
                    errors: [
                        {
                            path: "UpdateFarmDeliveryGradient",
                            message: "GraphShape: Error 3"
                        }
                    ]
                }
            }
        } catch (err) {
            return {
                errors: [
                    {
                        path: "UpdateFarmDeliveryGradient",
                        message: `GraphShape: ${err}`
                    }
                ],
            };
        }
    }
}
export default GraphShape2;