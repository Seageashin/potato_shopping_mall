import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from "@nestjs/common";
import { UserService } from "./users.service";
import { SignUpDto } from "./dto/signup.dto";
import { Sign_inDto } from "./dto/sign_in.dto";
import { Users } from "./entities/user.entitiy";
import { updateDto } from "./dto/update.dto";


@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(@Body() signUpDto: SignUpDto, @Res() res) {
    await this.userService.register(signUpDto);
    res.send("회원가입되었습니다. 로그인해주세요!");
  }

  @Post("login")
  async signin(@Body() sign_inDto: Sign_inDto, @Res() res) {
    return res.status(HttpStatus.OK).json({
      message: "로그인 완료 ",
      access_token: await this.userService.sign_in(sign_inDto),
    });
  }

  @Get("list")
  async findAll() {
    return await this.userService.findAll();
  }

  @Get("info/:id")
  async findOne(@Param("id") id: number): Promise<Users> {
    return await this.userService.findOne(id);
  }

  @Patch("update/:id")
  async update(@Param("id") id: number, @Body() UpdateDto: updateDto) {
    await this.userService.update(+id, UpdateDto);
    return { message: "수정되었습니다" };
  }

  @Delete("delete/:id")
  async remove(@Param("id") id: number) {
    await this.userService.remove(id);
    return { message: "삭제 되었습니다" };
  }
}
