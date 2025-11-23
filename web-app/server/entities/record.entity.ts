import { Column, Entity, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('record')
@Index(['visitStartedAt', 'visitFinishedAt'])
export class Record {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @CreateDateColumn()
    visitStartedAt: Date;

    @Index()
    @Column('datetime', { nullable: true })
    visitFinishedAt: Date;

    @Index()
    @Column('varchar', { nullable: true })
    exitReason: String;

    @UpdateDateColumn()
    updatedAt: Date;
}
