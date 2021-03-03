import { Field, Float, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, Generated, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DeliveryGradient, Geocode } from "../Figures/ObjectTypes";
import { Account } from "./Account";
import { Vegetable } from "./Vegetable";


@ObjectType()
@Entity()
@Index("Farm_Location", ["lat_min", "lat_max", "lng_min", "lng_max", "lat_r", "lng_r", "angular_r"])
export class Farm extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Account)
    @OneToOne(() => Account, account => account.farm, { onDelete: "CASCADE" })
    @JoinColumn()
    account: Account;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    accountId: number | null;

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

    @Field(() => Geocode)
    @Column({ type: "jsonb" })
    geocode: Geocode;

    @Field(() => [DeliveryGradient])
    @Column({ type: "jsonb" })
    delivery_gradient: DeliveryGradient[];

    @Field()
    @Column()
    farm_name: string;

    @Field()
    @Column({ default: false })
    allow_pickup: boolean;

    @Field(() => Float)
    @Column({ type: "float" })
    lat_r: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lng_r: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lat_min: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lat_max: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lng_min: number;

    @Field(() => Float)
    @Column({ type: "float" })
    lng_max: number;

    // maximum delivery distance angular radius
    @Field(() => Float)
    @Column({ type: "float" })
    angular_r: number;

    @Field(() => [Vegetable], { nullable: true })
    @OneToMany(() => Vegetable, vegetable => vegetable.farm)
    @JoinColumn()
    vegetables: Vegetable[];

    //@Field(() => [Int], { nullable: true })
    //@Column({ nullable: true })
    //vegetableId: number[];

}