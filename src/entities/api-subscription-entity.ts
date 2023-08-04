import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user-entity";
import { Blog } from "./blog-entity";
import { randomUUID } from "crypto";

@Entity({ database: "tfaepjvr" })
export class APISubscriptionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  isSubscribed: boolean // is
  @Column()
  dateOfSubscription: string // date of subscription

  @ManyToOne(() => User, u => u.subscribtionOfUser, {onDelete : 'SET NULL'})
  @JoinColumn()
  subscriber : User
  @ManyToOne(() => Blog, blog => blog.subscribtionOfBlog, {onDelete : 'SET NULL'})
  @JoinColumn()
  blog : Blog


  static createNewSubscribtion(foundBlog: Blog, foundUser: User) {
    const newSubscription = new APISubscriptionEntity()

    newSubscription.id = randomUUID();
    newSubscription.isSubscribed = true
    newSubscription.dateOfSubscription =  new Date().toISOString() // date of subscription
    newSubscription.subscriber = foundUser
    newSubscription.blog = foundBlog

    return newSubscription
  }

  static createNewUnsubscribtion(oldSubscription : APISubscriptionEntity) {
    const newSubscription = new APISubscriptionEntity()

    newSubscription.id = oldSubscription.id;
    newSubscription.isSubscribed = false
    newSubscription.dateOfSubscription =  oldSubscription.dateOfSubscription // date of subscription
    newSubscription.subscriber = oldSubscription.subscriber
    newSubscription.blog = oldSubscription.blog

    return newSubscription
  }
}
