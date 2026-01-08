import { Controller, Patch, Delete, Body, Param, UseGuards, Req, Get } from '@nestjs/common';
import { MarketPlaceAdminService } from './marketplace_admin.service';
import { IsSuperAdminGuard } from 'src/core/guards/is.admin.or.super.guard';
import { V1Controller } from 'src/core/common/v1-controller.decorator';

@UseGuards(IsSuperAdminGuard)
@V1Controller('marketplace-admin')
export class MarketPlaceAdminController {
  constructor(private readonly adminService: MarketPlaceAdminService) { }

  @Patch('users/:id/warn')
  async warnUser(
    @Param('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.warnUser(userId, reason);
  }

  @Patch('users/:id/ban')
  async banUser(@Param('id') userId: string, @Body('reason') reason: string) {
    return this.adminService.banUser(userId, reason);
  }

  @Patch('users/:id/unban')
  async unbanUser(@Param('id') userId: string) {
    return this.adminService.unbanUser(userId);
  }

  @Delete('listings/:id')
  async removeListing(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.banListing(id, reason);
  }

  @Patch('listings/:id/edit')
  async editListing(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.adminEditListing(id, updateData);
  }
  // get all users -> for admin dashboard
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

}