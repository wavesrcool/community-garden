/*import "reflect-metadata";
import { toRadians, EARTH_RADIUS } from "spherical-geometry-js";
import { createQueryBuilder, getConnection, getManager } from "typeorm";

import { AccountType } from "../Topology/Figures/EnumTypes";
import { DualCredential, SignUpPublicInput, SignUpFarmInput, UpdateAccountEmailInput, UpdateAccountIdentityInput, UpdateFarmIdentityInput, VegetableCreateInput, QuantityMapCreateInput, UpdateAccountGeocodeInput, UpdateFarmDeliveryGradientInput } from "../Topology/Figures/InputTypes";
import { GraphResponse, LoginResponse, PublicResponse, SignUpResponse, VegetableResponse } from "../Topology/Figures/ObjectTypes";
import argon2 from "argon2";
import { Account } from "../Topology/Atlas/Account";
import { Vegetable } from "../Topology/Atlas/Vegetable";
import { QuantityMap } from "../Topology/Atlas/QuantityMap";
import { Geocode } from "../Topology/Atlas/Geocode";
import CommunityGarden from "../../../src/CommunityGarden/core";
import { Farm } from "../Topology/Atlas/Farm";

const GraphCompose = {




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
}

export default GraphCompose;*/