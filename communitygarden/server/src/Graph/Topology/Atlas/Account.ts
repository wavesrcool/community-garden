import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AccountRole, AccountType } from "../Figures/EnumTypes";
import { Farm } from "./Farm";
import { Geocode } from "./Geocode";

@ObjectType()
@Entity()
export class Account extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

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

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    farmId: number;

    @Field(() => Farm, { nullable: true })
    @OneToOne(() => Farm, farm => farm.account, { onDelete: "CASCADE" })
    @JoinColumn()
    farm: Farm;

    @Field(() => Geocode)
    @OneToOne(() => Geocode, geocode => geocode.account)
    @JoinColumn()
    geocode: Geocode;

    @Field(() => AccountRole)
    @Column({ type: "enum", enum: AccountRole, default: AccountRole.CG })
    role!: AccountRole;

    @Field(() => AccountType)
    @Column({ type: "enum", enum: AccountType, default: AccountType.PUBLIC })
    account_type!: AccountType;

    @Field()
    @Column({ default: false })
    locked: boolean;

    @Field()
    @Column({ default: false })
    verified_email: boolean;

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

    // omit Field()
    @Column()
    password!: string;
}