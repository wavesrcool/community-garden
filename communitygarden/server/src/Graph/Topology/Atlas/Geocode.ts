import { Field, Float, Int, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Account } from "./Account";

@ObjectType()
@Entity()
//@Index("Farm_Location", ["lat_min", "lat_max", "lng_min", "lng_max", "lat_r", "lng_r", "angular_r"])
export class Geocode {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    accountId: number;

    @Field(() => Account)
    @OneToOne(() => Account, account => account.geocode, { onDelete: "CASCADE" })
    @JoinColumn()
    account: Account;

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

    @Field(() => Float)
    @Column()
    lat: number;

    @Field(() => Float)
    @Column()
    lng: number;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    formatted_address?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    street_number?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    route?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    locality?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    administrative_area_level_2?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    administrative_area_level_1?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    country?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    postal_code?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    location_type?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    global_code?: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    place_id?: string;
}