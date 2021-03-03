import { ObjectType, Field, Float, Int } from "type-graphql";
import { Account } from "../Atlas/Account";
import { Farm } from "../Atlas/Farm";
import { Vegetable } from "../Atlas/Vegetable";
import { CurrencyCodes, MeasurementUnits } from "./EnumTypes";

@ObjectType()
export class ErrorList {
    @Field()
    path?: string;

    @Field()
    message?: string;
}

@ObjectType()
export class PublicResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => Account, { nullable: true })
    account?: Account;

    @Field(() => Farm, { nullable: true })
    farm?: Farm;

    @Field(() => Boolean, { nullable: true })
    deleted?: boolean;

    @Field(() => Boolean, { nullable: true })
    updated?: boolean;
}

@ObjectType()
export class Geolocation {
    @Field(() => Float)
    lat: number;

    @Field(() => Float)
    lng: number;
}


@ObjectType()
export class Geocode {
    @Field(() => Geolocation)
    geolocation: Geolocation;

    @Field(() => String, { nullable: true })
    formatted_address?: string;

    @Field(() => String, { nullable: true })
    street_number?: string;

    @Field(() => String, { nullable: true })
    route?: string;

    @Field(() => String, { nullable: true })
    locality?: string;

    @Field(() => String, { nullable: true })
    administrative_area_level_2?: string;

    @Field(() => String, { nullable: true })
    administrative_area_level_1?: string;

    @Field(() => String, { nullable: true })
    country?: string;

    @Field(() => String, { nullable: true })
    postal_code?: string;

    @Field(() => String, { nullable: true })
    location_type?: string;

    @Field(() => String, { nullable: true })
    global_code?: string;

    @Field(() => String, { nullable: true })
    place_id?: string;
}

@ObjectType()
export class DeliveryGradient {
    @Field(() => Float)
    radius: number;

    @Field(() => Float)
    cost: number;
}

@ObjectType()
export class BotanicalVegetable {
    @Field()
    nameCommon!: string;

    @Field()
    nameGeneric: string;

    @Field()
    nameSpecificEpithet: string;
}

@ObjectType()
export class VegetableResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => Vegetable, { nullable: true })
    vegetable?: Vegetable;

    @Field(() => Boolean, { nullable: true })
    created?: boolean;

    @Field(() => Boolean, { nullable: true })
    updated?: boolean;

    @Field(() => Boolean, { nullable: true })
    deleted?: boolean;
}

@ObjectType()
export class QuantityMap {
    @Field(() => Int)
    value: number;

    @Field(() => Float)
    dollars: number;

    @Field(() => CurrencyCodes)
    currency: string;

    @Field(() => Int)
    available: number;
}

@ObjectType()
export class MeasurementMap {
    @Field(() => Float)
    value: number;

    @Field(() => MeasurementUnits)
    unit: string;

    @Field(() => Float)
    dollars: number;

    @Field(() => CurrencyCodes)
    currency: string;

    @Field(() => Int)
    available: number;
}