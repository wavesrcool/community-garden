import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AccountRole, AccountType } from "../Figures/EnumTypes";
import { Geocode } from "../Figures/ObjectTypes";
import { Farm } from "./Farm";

@ObjectType()
@Entity()
export class Account extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Farm, { nullable: true })
    @OneToOne(() => Farm, farm => farm.account)
    @JoinColumn()
    farm: Farm;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    farmId: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @Column()
    @Generated("uuid")
    cg: string;

    @Field(() => AccountRole)
    @Column({ type: "enum", enum: AccountRole, default: AccountRole.CG })
    role!: AccountRole;

    @Field(() => AccountType)
    @Column({ type: "enum", enum: AccountType, default: AccountType.PUBLIC })
    account_type!: AccountType;

    @Field()
    @Column({ default: true })
    locked: boolean;

    @Field()
    @Column({ default: false })
    verified_email: boolean;

    @Field(() => Geocode)
    @Column({ type: "jsonb" })
    geocode: Geocode;

    @Field()
    @Column()
    first_name!: string;

    @Field()
    @Column()
    last_name!: string;

    @Field()
    @Column()
    birth_date!: string;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    // no @Field ... cannot be queried over qraphql
    @Column()
    password!: string;
}