import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
} from "@nestjs/common";
import { AdminPanelService } from "./admin_panel.service";
import { V1Controller } from "../../core/common/v1-controller.decorator";
import { IsSuperAdminGuard } from "../../core/guards/is.admin.or.super.guard";
import { UpdateConfigDto } from "./dto/update_config_dto";
import { resOK } from "../../core/utils/res.helpers";
import { MongoIdDto } from "../../core/common/dto/mongo.id.dto";
import { BanToDto, CreateNewVersionDto, GetVersionDto } from "./dto/admin_dto";
import { CreateAdminNotificationDto } from "../admin_notification/dto/create-admin_notification.dto";
import { MongoRoomIdDto } from "../../core/common/dto/mongo.room.id.dto";
import { imageFileInterceptor } from "../../core/utils/upload_interceptors";
import { UserRole } from "src/core/utils/enums";
import { CreateCategoryDto, UpdateCategoryDto } from "./category/category.dto";
import { CategoryService } from "./category/category.service";
import { SubscriptionPlanService } from "../subscription-plan/subscription-plan.service";
import { UpdateSubscriptionPlanDto } from "src/core/common/dto/update-subscription-plan.dto";
import { CreateSubscriptionPlanDto } from "src/core/common/dto/subscription.plan.dto";
import { SettingsService } from "../setting/settings.service";
import { UpdateSettingsDto } from "../setting/dto/update-settings.dto";
import { CreateSettingsDto } from "../setting/dto/create-settings.dto";
import { TransactionService } from "../transactions/transaction.service";
import { VerificationService } from "../verification/verification.service";
import { VerificationStatus } from "../verification/schema/verification-request.schema";
import { BroadcastMessageDto } from "./dto/broadcast-message.dto";
import { DriverService } from "src/ride/driver/driver.service";
import { driverProfileStatus } from "src/ride/driver/entity/driver.entity";
import { GetDriversFilterDto, UpdateDriverStatusDto } from "src/ride/driver/dto/status-dto";
import { RidesService } from "src/ride/rides/rides.service";

@UseGuards(IsSuperAdminGuard)
@V1Controller("admin-panel")
export class AdminPanelController {
  constructor(
    private readonly adminPanelService: AdminPanelService,
    private readonly categoryService: CategoryService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly settingsService: SettingsService,
    private readonly transactionService: TransactionService,
    private readonly verificationService: VerificationService,
    private readonly driverService: DriverService,
    private readonly rideService: RidesService,
  ) { }

  @Get('ride-points/settings/get')
  async getRidePointsSetting() {
    return await this.rideService.getLoyaltySettings;
  }

  @Put("ride-points/settings")
  async updateRidePointsSettings(@Body() body: any) {
    return await this.rideService.updateLoyaltySettings(body);
  }

  // get all drivers 
  @Get("all-drivers")
  async getAllDriver() {
    return await this.driverService.getAllDrivers();
  }

  @Post("/send-broadcast/notification")
  @UseInterceptors(imageFileInterceptor)
  async sendBroadcastNotification(
    @Body() body: BroadcastMessageDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.adminPanelService.sendBroadcastNotification(body, file);
  }

  @Post("/verification/requests/:id/reject")
  rejectRequest(@Param("id") id: string, @Body("reason") reason: string) {
    return this.verificationService.rejectRequest(id, reason);
  }

  @Post("/verification/requests/:id/approve")
  async approveApplication(@Param("id") id: string) {
    return this.verificationService.approveVerificationProcess(id);
  }

  @Get("/verification/requests/get-all")
  async getVerificationApplications(
    @Query("status") status: VerificationStatus
  ) {
    return this.verificationService.getVerificationsApplications(status);
  }

  @Get("/total-system-share")
  async getTotalSystemShare() {
    const totalShare = await this.transactionService.getTotalSystemShare();
    return {
      totalSystemShare: totalShare,
    };
  }

  @Post("/commission")
  async createCommission(@Body() createCommissionSetting: CreateSettingsDto) {
    return this.settingsService.create(createCommissionSetting);
  }

  @Get("/commission")
  async getAppCommission() {
    return this.settingsService.getSettings();
  }

  @Put("/commission")
  async updateAppCommission(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  @Post("/subscription-plans")
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return resOK(await this.subscriptionPlanService.create(dto));
  }

  @Get("/subscription-plans")
  async getAllPlans() {
    return resOK(await this.subscriptionPlanService.findAll());
  }

  @Get("/subscription-plans/:id")
  async getPlanById(@Param("id") id: string) {
    return resOK(await this.subscriptionPlanService.findOne(id));
  }

  @Patch("/subscription-plans/:id")
  async updatePlan(
    @Param("id") id: string,
    @Body() dto: UpdateSubscriptionPlanDto
  ) {
    return resOK(await this.subscriptionPlanService.update(id, dto));
  }

  @Post("/categories")
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryService.create(createCategoryDto);
    return resOK(category);
  }

  @Get("/categories")
  async findAll() {
    const categories = await this.categoryService.findAll();
    return resOK(categories);
  }

  @Patch("/categories/:id")
  async update(
    @Param() params: MongoIdDto,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    const updatedCategory = await this.categoryService.update(
      params.id,
      updateCategoryDto
    );
    return resOK(updatedCategory);
  }

  @Delete("/categories/:id")
  async remove(@Param() params: MongoIdDto) {
    const result = await this.categoryService.remove(params.id);
    return resOK(result);
  }

  @Patch("/config")
  async updateConfig(@Req() req: any, @Body() dto: UpdateConfigDto) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.updateConfig(dto));
  }

  @Get("/config")
  async getConfig(@Req() req: any) {
    return resOK(await this.adminPanelService.getAppConfig());
  }

  @Patch("/versions")
  async setNewVersion(@Req() req: any, @Body() dto: CreateNewVersionDto) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.setNewVersion(dto));
  }

  @Post("/notifications")
  @UseInterceptors(imageFileInterceptor)
  async createNotifications(
    @Req() req: any,
    @Body() dto: CreateAdminNotificationDto,
    @UploadedFile() file?: any
  ) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    if (file) {
      dto.imageBuffer = file.buffer;
    }
    return resOK(await this.adminPanelService.createNotification(dto));
  }

  @Get("/notifications")
  async getNotifications() {
    return resOK(await this.adminPanelService.getNotification());
  }

  @Get("/users/log")
  async getUsersLog() {
    return resOK(await this.adminPanelService.getUsersLog());
  }

  @Get("/versions/:platform")
  async getVersionDashboard(@Param() platform: GetVersionDto) {
    return resOK(await this.adminPanelService.getVersions(platform));
  }

  @Delete("/versions/:id")
  async deleteVersion(@Req() req: any, @Param() id: MongoIdDto) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.deleteVersion(id));
  }

  @Get("/countries")
  async getCountryInfo() {
    return resOK(await this.adminPanelService.getCountriesInfo());
  }

  @Get("/user/info/:id")
  async getUserInfo(@Param() dto: MongoIdDto) {
    return resOK(await this.adminPanelService.getUserInfo(dto));
  }

  @Get("/user/info/:id/chats")
  async getUserChats(@Param() dto: MongoIdDto, @Query() filter: Object) {
    return resOK(await this.adminPanelService.getUserChats(dto.id, filter));
  }

  @Get("/user/info/:id/chats/:roomId")
  async getUserChatsMessages(
    @Param() roomIdDto: MongoRoomIdDto,
    @Query() filter: Object,
    @Param() userId: MongoIdDto
  ) {
    return resOK(
      await this.adminPanelService.getUserChatsMessages(
        userId.id,
        roomIdDto.roomId,
        filter
      )
    );
  }

  @Patch("/user/info/:id")
  async updateUserInfo(
    @Req() req: any,
    @Param() dto: MongoIdDto,
    @Body() body: object
  ) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.updateUserInfo(dto.id, body));
  }

  @Patch("/user/role/:id")
  async updateUserRole(
    @Req() req: any,
    @Param() dto: MongoIdDto,
    @Body() body: { roles: UserRole[] } // Expect an array of roles from frontend
  ) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.updateUserRole(dto.id, body));
  }

  @Patch("/user/ban/:id")
  async banUser(
    @Param("id") id: string,
    @Body() body: { type: "general" | "message" | "live"; until: Date }
  ) {
    return resOK(await this.adminPanelService.banUser(id, body));
  }

  @Patch("/user/unban/:id")
  async unbanUser(
    @Param("id") id: string,
    @Body() body: { type: "general" | "message" | "live" }
  ) {
    return resOK(await this.adminPanelService.unbanUser(id, body));
  }

  @Patch("/user/verify/:id")
  async verifyUser(@Param("id") id: string) {
    return resOK(await this.adminPanelService.verifyUser(id));
  }

  @Patch("/user/unverify/:id")
  async unverifyUser(@Param("id") id: string) {
    return resOK(await this.adminPanelService.unverifyUser(id));
  }

  @Get("/users")
  async getUsers(@Query() dto: Object) {
    return resOK(await this.adminPanelService.getUsers(dto));
  }

  @Post("/login")
  async login(@Req() req: any) {
    return resOK(await this.adminPanelService.login(req["isViewer"]));
  }

  @Get("/dashboard")
  async getDashboard() {
    return resOK(await this.adminPanelService.getDashboard());
  }

  @Get("/users/reports")
  async getUserReports(@Query() filter: Object) {
    return resOK(await this.adminPanelService.getUserReports(filter));
  }

  @Delete("/users/reports/:id")
  async deleteReport(@Req() req: any, @Param() dto: MongoIdDto) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.deleteReport(dto.id));
  }

  @Get("/user/info/:id/groups")
  async getUserGroups(@Param() dto: MongoIdDto, @Query() filter: Object) {
    return resOK(await this.adminPanelService.getUserGroups(dto.id, filter));
  }

  @Delete("/groups/:id")
  async deleteGroup(@Req() req: any, @Param() dto: MongoIdDto) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.deleteGroup(dto.id));
  }

  @Get("/groups/:id/members")
  async getGroupMembers(@Param() dto: MongoIdDto, @Query() filter: Object) {
    return resOK(await this.adminPanelService.getGroupMembers(dto.id, filter));
  }

  @Get("/user/info/:id/stories")
  async getUserStories(@Param() dto: MongoIdDto, @Query() filter: Object) {
    return resOK(await this.adminPanelService.getUserStories(dto.id, filter));
  }

  @Delete("/stories/:id")
  async deleteStory(@Req() req: any, @Param() dto: MongoIdDto) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.deleteStory(dto.id));
  }

  // Gift Management Endpoints
  @Get("/gifts")
  async getGifts(@Query() filter: Object) {
    return resOK(await this.adminPanelService.getGifts(filter));
  }

  @Get("/gifts/:id")
  async getGiftById(@Param() dto: MongoIdDto) {
    return resOK(await this.adminPanelService.getGiftById(dto.id));
  }

  @Post("/gifts")
  @UseInterceptors(imageFileInterceptor)
  async createGift(
    @Req() req: any,
    @Body()
    data: {
      name: string;
      description?: string;
      price: number;
      isActive?: boolean;
    },
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.createGift(data, file));
  }

  @Patch("/gifts/:id")
  @UseInterceptors(imageFileInterceptor)
  async updateGift(
    @Req() req: any,
    @Param() dto: MongoIdDto,
    @Body()
    data: {
      name?: string;
      description?: string;
      price?: number;
      isActive?: boolean;
    },
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.updateGift(dto.id, data, file));
  }

  @Delete("/gifts/:id")
  async deleteGift(@Req() req: any, @Param() dto: MongoIdDto) {
    if (req["isViewer"]) {
      return resOK("YOU ARE VIEWER !!!");
    }
    return resOK(await this.adminPanelService.deleteGift(dto.id));
  }

  @Get('/drivers')
  async getSelectedDrivers(@Query() filterDto: GetDriversFilterDto) {
    return this.driverService.getSelectedDrivers(filterDto);
  }

  @Patch('/driver/update-status/:id')
  async updateStatus(
    @Param() Param: MongoIdDto,
    @Body() status: UpdateDriverStatusDto
  ) {
    return this.driverService.updateDriverStatus(Param.id, status)
  }
}
