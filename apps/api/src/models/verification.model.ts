import { Table, Column, Model, DataType, CreatedAt, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({
  tableName: VerificationModel.TABLE_NAME,
  timestamps: true,
  underscored: false,
})
export default class VerificationModel extends Model {
  public static readonly TABLE_NAME = 'verifications';
  public static readonly VERIFICATION_ID = 'id';
  public static readonly VERIFICATION_TOKEN = 'token';
  public static readonly VERIFICATION_PAGE = 'page';
  public static readonly VERIFICATION_SUCCESS = 'success';
  public static readonly VERIFICATION_IP_ADDRESS = 'ipAddress';
  public static readonly VERIFICATION_USER_AGENT = 'userAgent';
  public static readonly VERIFICATION_DEVICE = 'device';
  public static readonly VERIFICATION_CREATED_AT = 'createdAt';
  public static readonly VERIFICATION_UPDATED_AT = 'updatedAt';

  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    field: VerificationModel.VERIFICATION_ID,
  })
  id!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: VerificationModel.VERIFICATION_TOKEN,
  })
  token!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: VerificationModel.VERIFICATION_PAGE,
  })
  page?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: VerificationModel.VERIFICATION_SUCCESS,
  })
  success!: boolean;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: VerificationModel.VERIFICATION_IP_ADDRESS,
  })
  ipAddress?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: VerificationModel.VERIFICATION_USER_AGENT,
  })
  userAgent?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: VerificationModel.VERIFICATION_DEVICE,
  })
  device?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: VerificationModel.VERIFICATION_CREATED_AT,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    field: VerificationModel.VERIFICATION_UPDATED_AT,
  })
  updatedAt!: Date;
}

