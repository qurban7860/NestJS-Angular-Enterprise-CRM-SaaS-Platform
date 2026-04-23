import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserResponseDto,
} from '../../application/dtos/auth.dto';
import { Public } from '../../../../core/presentation/decorators/public.decorator';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    if (result.isFailure) {
      if (
        result.error?.includes('Invalid') ||
        result.error?.includes('deactivated')
      ) {
        throw new UnauthorizedException(result.error);
      }
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new organization and admin user' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    if (result.isFailure) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw result.error;
    }
    return result.getValue();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserResponseDto,
  })
  getProfile(@CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
