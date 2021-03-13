import { InputType, Field, Float, Int } from "type-graphql";
import { iso3166, MassUnit, VegetableName, VegetableState } from "./EnumTypes";

@InputType()
export class GeocodeInput {
    @Field(() => Float)
    lat: number;

    @Field(() => Float)
    lng: number;

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

@InputType()
export class DeliveryGradientInput {
    @Field(() => Float)
    radius: number;

    @Field(() => Float)
    cost: number;
}

@InputType()
export class SignUpPublicInput {
    @Field()
    first_name!: string;

    @Field()
    last_name!: string;

    @Field()
    birth_date!: string;

    @Field()
    email!: string;

    @Field()
    username!: string;

    @Field()
    password!: string;

    @Field(() => GeocodeInput)
    geocode!: GeocodeInput;
}

@InputType()
export class SignUpFarmInput {
    @Field()
    first_name!: string;

    @Field()
    last_name!: string;

    @Field()
    birth_date!: string;

    @Field()
    email!: string;

    @Field()
    username!: string;

    @Field()
    password!: string;

    @Field()
    farm_name!: string;

    @Field(() => Boolean)
    approves_pickup!: boolean;

    @Field(() => GeocodeInput)
    geocode!: GeocodeInput;

    @Field(() => [DeliveryGradientInput])
    delivery_gradient!: DeliveryGradientInput[];
}

@InputType()
export class DualCredential {
    @Field()
    username: string;

    @Field()
    password: string;
}

@InputType()
export class UniquesCredential {
    @Field()
    username: string;

    @Field()
    email: string;
}

@InputType()
export class ChangePasswordInput {
    @Field()
    token: string;

    @Field()
    new_password: string;
}

@InputType()
export class UpdateAccountIdentityInput {
    @Field()
    first_name: string;

    @Field()
    last_name: string;

    @Field()
    birth_date: string;
}

@InputType()
export class UpdateAccountEmailInput {
    @Field()
    email: string;
}

@InputType()
export class UpdateAccountUsernameInput {
    @Field()
    username: string;
}

@InputType()
export class UpdateAccountGeocodeInput {
    @Field(() => GeocodeInput)
    geocode: GeocodeInput;
}

@InputType()
export class UpdateFarmIdentityInput {
    @Field()
    farm_name: string;

    @Field(() => Boolean)
    approves_pickup: boolean;
}

@InputType()
export class UpdateFarmEmailInput {
    @Field()
    email: string;
}

@InputType()
export class UpdateFarmDeliveryGradientInput {
    @Field(() => [DeliveryGradientInput])
    delivery_gradient: DeliveryGradientInput[];
}

@InputType()
export class VegetableCreateInput {
    @Field(() => VegetableName)
    name: VegetableName;

    @Field(() => String, { nullable: true })
    other_name?: string;

    @Field(() => String)
    variety: string;

    @Field(() => VegetableState, { nullable: true })
    state?: VegetableState;
}


@InputType()
export class QuantityMapCreateInput {
    @Field(() => Int)
    vegetable_id: number;

    @Field(() => Int)
    available: number;

    @Field(() => Float, { nullable: true })
    mass: number;

    @Field(() => MassUnit, { nullable: true })
    mass_unit: MassUnit;

    @Field(() => String)
    tag: string;

    @Field(() => Float)
    valuation: number;

    @Field(() => iso3166)
    currency: iso3166;
}


@InputType()
export class ListAddInput {
    @Field()
    from: string;

    @Field()
    to: string;

    @Field()
    node: string;

    @Field()
    map: string;

    @Field(() => Int)
    quantity: number;

    @Field(() => Float)
    number: number;

    @Field(() => iso3166)
    symbol: iso3166;
}