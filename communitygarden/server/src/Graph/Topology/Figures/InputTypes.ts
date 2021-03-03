import { InputType, Field, Float, Int } from "type-graphql";
import { CurrencyCodes, MeasurementUnits } from "./EnumTypes";

@InputType()
export class GeolocationInput {
    @Field(() => Float)
    lat: number;

    @Field(() => Float)
    lng: number;
}

@InputType()
export class GeocodeInput {
    @Field(() => GeolocationInput)
    geolocation: GeolocationInput;

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
export class SignUpAccountInput {
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

    @Field(() => GeocodeInput)
    geocode!: GeocodeInput;

    @Field(() => [DeliveryGradientInput])
    delivery_gradient!: DeliveryGradientInput[];
}

@InputType()
export class LoginInput {
    @Field()
    username: string;

    @Field()
    password: string;
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
export class UpdateAccountGeocodeInput {
    @Field(() => GeocodeInput)
    geocode: GeocodeInput;
}

@InputType()
export class UpdateFarmIdentityInput {
    @Field()
    farm_name: string;

    @Field(() => Boolean)
    allow_pickup?: boolean;
}

@InputType()
export class UpdateFarmGeocodeInput {
    @Field(() => GeocodeInput)
    geocode: GeocodeInput;

    @Field(() => [DeliveryGradientInput])
    delivery_gradient?: DeliveryGradientInput[];
}

@InputType()
export class DeleteAccountInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@InputType()
class QuantityMapInput {
    @Field(() => Int)
    value: number;

    @Field(() => Float)
    dollars: number;

    @Field(() => CurrencyCodes)
    currency: string;

    @Field(() => Int)
    available: number;
}

@InputType()
class MeasurementMapInput {
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

@InputType()
export class VegetableCreateInput {
    @Field()
    index: string;

    @Field(() => [MeasurementMapInput], { nullable: true })
    measurements?: MeasurementMapInput[];

    @Field(() => [QuantityMapInput], { nullable: true })
    quantities?: QuantityMapInput[];
}

@InputType()
export class VegetableUpdateInput {
    @Field(() => [MeasurementMapInput], { nullable: true })
    measurements?: MeasurementMapInput[];

    @Field(() => [QuantityMapInput], { nullable: true })
    quantities?: QuantityMapInput[];
}