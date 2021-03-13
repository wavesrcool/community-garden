import "reflect-metadata"
import { ObjectType, Field, Float } from "type-graphql";
import { Account } from "../Atlas/Account";
import { List } from "../Atlas/List";
import { Vegetable } from "../Atlas/Vegetable";
import { AccountType } from "./EnumTypes";

@ObjectType()
export class DeliveryGradient {
    @Field(() => Float)
    radius: number;

    @Field(() => Float)
    cost: number;
}

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

    @Field(() => String, { nullable: true })
    communitygarden?: string;
}

@ObjectType()
export class AccountResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => Account, { nullable: true })
    account?: Account;
}

@ObjectType()
export class SignUpResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => String, { nullable: true })
    username?: string;

    @Field(() => String, { nullable: true })
    account?: string;

    @Field(() => AccountType, { nullable: true })
    account_type?: AccountType;
}

@ObjectType()
export class DeleteAccountResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => Boolean, { nullable: true })
    deleted?: boolean;
}

@ObjectType()
export class DeleteFarmResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => Account, { nullable: true })
    account?: Account;

    @Field(() => Boolean, { nullable: true })
    deleted?: boolean;
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
}

@ObjectType()
export class ListResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => List, { nullable: true })
    list?: List;
}

@ObjectType()
export class FarmPage {
    @Field()
    farm_name: string;

    @Field(() => [String])
    available_vegetables: [string];

    @Field(() => [String])
    growing_vegetables: [string];

    @Field(() => [Vegetable], { nullable: true })
    vegetables: Vegetable[];
}

@ObjectType()
export class FarmPageResponse {
    @Field(() => [ErrorList], { nullable: true })
    errors?: ErrorList[];

    @Field(() => FarmPage, { nullable: true })
    page?: FarmPage;
}



