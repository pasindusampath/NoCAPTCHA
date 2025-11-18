import VerificationModel from '../models/verification.model';
import { VerificationMetricsDto } from '@nx-mono-repo-deployment-test/shared';

interface CreateVerificationRecordData {
  token: string;
  page?: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
}

interface GetMetricsFilters {
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  page?: string;
  limit?: number;
  offset?: number;
}

class VerificationDao {
  private static instance: VerificationDao;

  private constructor() {}

  public static getInstance(): VerificationDao {
    if (!VerificationDao.instance) {
      VerificationDao.instance = new VerificationDao();
    }
    return VerificationDao.instance;
  }

  public async createVerificationRecord(data: CreateVerificationRecordData): Promise<VerificationMetricsDto> {
    try {
      const verification = await VerificationModel.create({
        [VerificationModel.VERIFICATION_TOKEN]: data.token,
        [VerificationModel.VERIFICATION_PAGE]: data.page,
        [VerificationModel.VERIFICATION_SUCCESS]: data.success,
        [VerificationModel.VERIFICATION_IP_ADDRESS]: data.ipAddress,
        [VerificationModel.VERIFICATION_USER_AGENT]: data.userAgent,
        [VerificationModel.VERIFICATION_DEVICE]: data.device,
      });
      
      const record = verification.toJSON();
      return new VerificationMetricsDto({
        id: record.id,
        token: record.token,
        page: record.page,
        success: record.success,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        device: record.device,
        timestamp: record.createdAt,
      });
    } catch (error) {
      console.error('Error in VerificationDao.createVerificationRecord:', error);
      throw error;
    }
  }

  public async getVerificationMetrics(filters: GetMetricsFilters = {}): Promise<{
    metrics: VerificationMetricsDto[];
    total: number;
  }> {
    try {
      const where: any = {};

      if (filters.startDate || filters.endDate) {
        const dateFilter: any = {};
        if (filters.startDate) {
          dateFilter[Op.gte] = filters.startDate;
        }
        if (filters.endDate) {
          dateFilter[Op.lte] = filters.endDate;
        }
        where[VerificationModel.VERIFICATION_CREATED_AT] = dateFilter;
      }

      if (filters.success !== undefined) {
        where[VerificationModel.VERIFICATION_SUCCESS] = filters.success;
      }

      if (filters.page) {
        where[VerificationModel.VERIFICATION_PAGE] = filters.page;
      }

      const queryOptions: any = {
        where,
        order: [[VerificationModel.VERIFICATION_CREATED_AT, 'DESC']],
      };

      if (filters.limit) {
        queryOptions.limit = filters.limit;
      }
      if (filters.offset) {
        queryOptions.offset = filters.offset;
      }

      const { count, rows } = await VerificationModel.findAndCountAll(queryOptions);

      const metrics = rows.map(verification => {
        const record = verification.toJSON();
        return new VerificationMetricsDto({
          id: record.id,
          token: record.token,
          page: record.page,
          success: record.success,
          ipAddress: record.ipAddress,
          userAgent: record.userAgent,
          device: record.device,
          timestamp: record.createdAt,
        });
      });

      return {
        metrics,
        total: count,
      };
    } catch (error) {
      console.error('Error in VerificationDao.getVerificationMetrics:', error);
      throw error;
    }
  }

  public async count(): Promise<number> {
    try {
      return await VerificationModel.count();
    } catch (error) {
      console.error('Error in VerificationDao.count:', error);
      throw error;
    }
  }
}

export default VerificationDao;

