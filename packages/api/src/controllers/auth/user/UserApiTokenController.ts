import type { User } from "@snailycad/types";
import { BodyParams, Context } from "@tsed/common";
import { Controller } from "@tsed/di";
import { BadRequest } from "@tsed/exceptions";
import { UseBefore } from "@tsed/platform-middlewares";
import { Delete, Description, Put } from "@tsed/schema";
import { userProperties } from "lib/auth/getSessionUser";
import { prisma } from "lib/prisma";
import { IsAuth } from "middlewares/IsAuth";
import { UsePermissions, Permissions } from "middlewares/UsePermissions";
import { nanoid } from "nanoid";
import type * as APITypes from "@snailycad/types/api";

@Controller("/user/api-token")
@UseBefore(IsAuth)
export class AccountController {
  @Put("/")
  @Description("Enable or disable the authenticated user's API Token.")
  @UsePermissions({
    fallback: false,
    permissions: [Permissions.UsePersonalApiToken],
  })
  async enableDisableUserAPIToken(
    @Context("user") user: User,
    @BodyParams() body: any,
  ): Promise<APITypes.PutUserEnableDisableApiTokenData> {
    if (body.enabled === false) {
      if (!user.apiTokenId) {
        return { ...user, apiToken: null, apiTokenId: null };
      }

      await prisma.apiToken.delete({ where: { id: user.apiTokenId } });

      return { ...user, apiToken: null, apiTokenId: null };
    }

    if (user.apiToken) {
      return user;
    }

    const apiToken = await prisma.apiToken.create({
      data: {
        enabled: true,
        token: nanoid(56),
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        apiTokenId: apiToken.id,
      },
      select: userProperties,
    });

    return updatedUser;
  }

  @Delete("/")
  @Description("Re-generate a token")
  @UsePermissions({
    fallback: false,
    permissions: [Permissions.UsePersonalApiToken],
  })
  async generateNewApiToken(
    @Context("user") user: User,
  ): Promise<APITypes.DeleteUserRegenerateApiTokenData> {
    if (!user.apiTokenId) {
      throw new BadRequest("noApiTokenId");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        apiToken: { update: { token: nanoid(56) } },
      },
      select: userProperties,
    });

    return updated;
  }
}
