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

export enum iso3166 {
    CAD = "CAD",
    USD = "USD",
}

registerEnumType(iso3166, {
    name: "CurrencyCodes",
    description: "Supported payment currencies, ISO 3166 format"
})

export enum MassUnit {
    GRAMS = "g",
    KILOGRAMS = "kg",
    POUNDS = "lb",
    OUNCES = "oz",
}

registerEnumType(MassUnit, {
    name: "MassUnit",
    description: "Supported measurement units for mass"
})

export enum VegetableName {
    TOMATOE = "Tomatoe",
    ASPARAGUS = "Asparagus",
    OTHER = "Other"
}

registerEnumType(VegetableName, {
    name: "VegetableName",
    description: "Indexed vegeable names, or other"
})

export enum VegetableState {
    AVAILABLE = "available",
    GROWING = "growing",
    UNLISTED = "unlisted"
}

registerEnumType(VegetableState, {
    name: "VegetableState",
    description: "3 states of a vegetable"
})