import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchConsoleService } from './search-console.service';
import { GscQueryDto } from './dto/gsc-query.dto';

@ApiTags('Search Console')
@Controller('search-console')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchConsoleController {
  private readonly logger = new Logger(SearchConsoleController.name);

  constructor(private readonly searchConsoleService: SearchConsoleService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get GSC overview for dashboard (last 28 days vs previous 28 days)' })
  async getOverview(@Request() req: { user: { id: string } }, @Query('websiteId') websiteId?: string) {
    this.logger.log(`Overview data requested by user ${req.user.id} for website ${websiteId || 'default'}`);

    // Default to last 28 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday (GSC data has 2-day delay)
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 27);

    // Previous period for comparison
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - 27);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    try {
      // Fetch current period data
      const currentData = await this.searchConsoleService.getPerformanceData(req.user.id, {
        websiteId: websiteId || '',
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });

      // Fetch previous period data for comparison
      let prevData: typeof currentData | null = null;
      try {
        prevData = await this.searchConsoleService.getPerformanceData(req.user.id, {
          websiteId: websiteId || '',
          startDate: formatDate(prevStartDate),
          endDate: formatDate(prevEndDate),
        });
      } catch {
        // Ignore errors for previous period
      }

      // Calculate changes
      const calcChange = (current: number, prev: number | undefined) => {
        if (!prev || prev === 0) return 0;
        return ((current - prev) / prev) * 100;
      };

      return {
        clicks: currentData.totalClicks,
        impressions: currentData.totalImpressions,
        ctr: currentData.averageCtr,
        position: currentData.averagePosition,
        clicksChange: calcChange(currentData.totalClicks, prevData?.totalClicks),
        impressionsChange: calcChange(currentData.totalImpressions, prevData?.totalImpressions),
        ctrChange: calcChange(currentData.averageCtr, prevData?.averageCtr),
        positionChange: prevData ? currentData.averagePosition - prevData.averagePosition : 0,
        topQueries: currentData.topQueries?.slice(0, 5) || [],
        topPages: currentData.topPages?.slice(0, 5) || [],
        dailyData: currentData.dailyPerformance?.map(d => ({
          date: d.date.slice(5), // MM-DD format
          clicks: d.clicks,
          impressions: d.impressions,
        })) || [],
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      };
    } catch (error: any) {
      this.logger.error(`Error in getOverview endpoint: ${error?.message || error}`, error?.stack);
      throw error;
    }
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get Insights: Your content, Queries, Top countries, Additional traffic sources (GSC)' })
  async getInsights(@Request() req: { user: { id: string } }, @Query() query: GscQueryDto) {
    if (!query.websiteId || !query.startDate || !query.endDate) {
      throw new BadRequestException('websiteId, startDate, and endDate are required');
    }
    this.logger.log(`Insights data requested by user ${req.user.id} for website ${query.websiteId}`);
    try {
      return await this.searchConsoleService.getInsights(req.user.id, query);
    } catch (error: any) {
      this.logger.error(`Error in getInsights endpoint: ${error?.message || error}`, error?.stack);
      throw error;
    }
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get search performance data (default view)' })
  async getPerformance(@Request() req: { user: { id: string } }, @Query() query: GscQueryDto) {
    this.logger.log(`Performance data requested by user ${req.user.id} for website ${query.websiteId}`);
    try {
      return await this.searchConsoleService.getPerformanceData(req.user.id, query);
    } catch (error: any) {
      this.logger.error(`Error in getPerformance endpoint: ${error?.message || error}`, error?.stack);
      throw error;
    }
  }

  @Get('pages')
  @ApiOperation({ summary: 'Get top pages data' })
  async getPages(@Request() req: { user: { id: string } }, @Query() query: GscQueryDto) {
    this.logger.log(`Top pages requested by user ${req.user.id} for website ${query.websiteId}`);
    return this.searchConsoleService.getTopPages(req.user.id, query);
  }

  @Get('queries')
  @ApiOperation({ summary: 'Get top queries/keywords data' })
  async getQueries(@Request() req: { user: { id: string } }, @Query() query: GscQueryDto) {
    this.logger.log(`Top queries requested by user ${req.user.id} for website ${query.websiteId}`);
    return this.searchConsoleService.getTopQueries(req.user.id, query);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get device breakdown data' })
  async getDevices(@Request() req: { user: { id: string } }, @Query() query: GscQueryDto) {
    this.logger.log(`Device data requested by user ${req.user.id} for website ${query.websiteId}`);
    return this.searchConsoleService.getDevices(req.user.id, query);
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get country breakdown data' })
  async getCountries(@Request() req: { user: { id: string } }, @Query() query: GscQueryDto) {
    this.logger.log(`Country data requested by user ${req.user.id} for website ${query.websiteId}`);
    return this.searchConsoleService.getCountries(req.user.id, query);
  }

  @Get('appearance')
  @ApiOperation({ summary: 'Get search appearance data' })
  async getAppearance(@Request() req: { user: { id: string } }, @Query() query: GscQueryDto) {
    this.logger.log(`Search appearance data requested by user ${req.user.id} for website ${query.websiteId}`);
    return this.searchConsoleService.getSearchAppearance(req.user.id, query);
  }

  @Get('indexing')
  @ApiOperation({ summary: 'Get indexing and coverage data' })
  async getIndexing(@Request() req: { user: { id: string } }, @Query('websiteId') websiteId: string) {
    if (!websiteId) {
      throw new BadRequestException('websiteId is required');
    }
    this.logger.log(`Indexing data requested by user ${req.user.id} for website ${websiteId}`);
    return this.searchConsoleService.getIndexingData(req.user.id, websiteId);
  }

  @Get('experience')
  @ApiOperation({ summary: 'Get Core Web Vitals data' })
  async getExperience(@Request() req: { user: { id: string } }, @Query('websiteId') websiteId: string) {
    if (!websiteId) {
      throw new BadRequestException('websiteId is required');
    }
    this.logger.log(`Core Web Vitals data requested by user ${req.user.id} for website ${websiteId}`);
    return this.searchConsoleService.getCoreWebVitals(req.user.id, websiteId);
  }

  @Get('security')
  @ApiOperation({ summary: 'Get security and manual actions data' })
  async getSecurity(@Request() req: { user: { id: string } }, @Query('websiteId') websiteId: string) {
    if (!websiteId) {
      throw new BadRequestException('websiteId is required');
    }
    this.logger.log(`Security data requested by user ${req.user.id} for website ${websiteId}`);
    return this.searchConsoleService.getSecurityData(req.user.id, websiteId);
  }

  @Get('internal-links')
  @ApiOperation({ summary: 'Get internal links data' })
  async getInternalLinks(@Request() req: { user: { id: string } }, @Query('websiteId') websiteId: string) {
    if (!websiteId) {
      throw new BadRequestException('websiteId is required');
    }
    this.logger.log(`Internal links data requested by user ${req.user.id} for website ${websiteId}`);
    return this.searchConsoleService.getInternalLinks(req.user.id, websiteId);
  }

  @Get('links')
  @ApiOperation({ summary: 'Get Links report (internal, external, top linking sites, top linking text)' })
  async getLinks(@Request() req: { user: { id: string } }, @Query('websiteId') websiteId: string) {
    if (!websiteId) {
      throw new BadRequestException('websiteId is required');
    }
    this.logger.log(`Links data requested by user ${req.user.id} for website ${websiteId}`);
    return this.searchConsoleService.getLinks(req.user.id, websiteId);
  }
}
