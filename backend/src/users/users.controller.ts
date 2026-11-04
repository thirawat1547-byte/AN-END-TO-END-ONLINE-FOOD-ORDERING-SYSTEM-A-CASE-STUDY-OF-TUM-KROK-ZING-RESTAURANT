import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดึงรายชื่อผู้ใช้งานทั้งหมดในระบบ (เฉพาะ Role ADMIN)' })
  @ApiResponse({ status: 200, description: 'ดึงรายชื่อผู้ใช้งานสำเร็จ (ไม่รวมรหัสผ่าน/แฮช)' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบหรือไม่ได้รับอนุญาต (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (Forbidden - เฉพาะผู้ดูแลระบบ ADMIN เท่านั้น)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดึงข้อมูลผู้ใช้งานรายบุคคลตาม ID (เฉพาะ Role ADMIN)' })
  @ApiParam({ name: 'id', description: 'รหัสผู้ใช้งาน (user_id)', example: 1 })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลผู้ใช้งานสำเร็จ' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบหรือไม่ได้รับอนุญาต' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง' })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้งานตาม ID ที่ระบุ' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}

