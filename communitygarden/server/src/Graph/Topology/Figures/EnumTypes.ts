import { registerEnumType } from "type-graphql";

export enum AccountType {
    PUBLIC = "PUBLIC",
    FARM = "FARM",
    ARTISAN = "ARTISAN",
};

registerEnumType(AccountType, {
    name: "AccountType",
    description: "Community Garden account types."
});

export enum AccountRole {
    ADMIN = "ADMIN",
    CG = "CG"
};

registerEnumType(AccountRole, {
    name: "AccountRole",
    description: "Community Garden account roles."
});

/*
export enum GeocodeLocationTypes {
    ROOFTOP = "ROOFTOP",
    RANGE_INTERPOLATED = "RANGE_INTERPOLATED",
    GEOMETRIC_CENTER = "GEOMETRIC_CENTER",
    APPROXIMATE = "APPROXIMATE",
}

registerEnumType(GeocodeLocationTypes, {
    name: "GeocodeLocationTypes",
    description: "Google Maps API result.geometry.location_types"
})
*/

export enum CurrencyCodes {
    CAD = "CAD",
    USD = "USD",
}

export enum MeasurementUnits {
    GRAMS = "g",
    KILOGRAMS = "kg",
    POUNDS = "lb",
    OUNCES = "oz",
}

registerEnumType(CurrencyCodes, {
    name: "CurrencyCodes",
    description: "Supported payment currencies, ISO 4217 format"
})

registerEnumType(MeasurementUnits, {
    name: "MeasurementUnits",
    description: "Supported measurement units, metric and imperial"
})