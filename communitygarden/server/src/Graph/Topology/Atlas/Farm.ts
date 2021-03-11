import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DeliveryGradient } from "../Figures/ObjectTypes";
import { Account } from "./Account";
import { Vegetable } from "./Vegetable";


@ObjectType()
@Entity()
export class Farm extends BaseEntity {
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
    accountId: number;

    @Field(() => Account)
    @OneToOne(() => Account, account => account.farm, { onDelete: "CASCADE" })
    @JoinColumn()
    account: Account;

    @Field(() => [Vegetable], { nullable: true })
    @OneToMany(() => Vegetable, vegetable => vegetable.farm)
    vegetables: Vegetable[];

    @Field()
    @Column()
    farm_name: string;

    @Field()
    @Column()
    approves_pickup: boolean;

    @Field(() => [DeliveryGradient])
    @Column({ type: "jsonb" })
    delivery_gradient: DeliveryGradient[];
}