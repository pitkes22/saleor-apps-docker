import { router } from "../../trpc/trpc-server";

import { z } from "zod";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { AvataxConnectionService } from "../configuration/avatax-connection.service";
import { AvataxTaxCodesService } from "./avatax-tax-codes.service";
import { createLogger } from "../../../logger";
import { AvataxClient } from "../avatax-client";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { TRPCError } from "@trpc/server";

const getAllForIdSchema = z.object({
  connectionId: z.string(),
  filter: z.string().nullable(),
  uniqueKey: z.string(),
});

export const avataxTaxCodesRouter = router({
  getAllForId: protectedClientProcedure.input(getAllForIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("avataxTaxCodesRouter.getAllForId");

    logger.info("Called route", {
      connectionId: input.connectionId,
      filter: input.filter,
    });

    const connectionService = new AvataxConnectionService({
      appId: ctx.appId!,
      client: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const connection = await connectionService.getById(input.connectionId).catch((err) => {
      logger.error("Failed to resolve connection from settings", { error: err });

      throw new TRPCError({
        message: "Failed to resolve configuration, please try again",
        code: "INTERNAL_SERVER_ERROR",
      });
    });

    logger.info("Resolved configuration connection from settings", {
      connectionName: connection.config.name,
    });

    const taxCodesService = new AvataxTaxCodesService(
      new AvataxClient(new AvataxSdkClientFactory().createClient(connection.config)),
    );

    logger.debug("Returning tax codes");

    return taxCodesService.getAllFiltered({ filter: input.filter }).catch((err) => {
      logger.error("Failed to fetch tax codes from Avatax", { error: err });

      // TODO Map specific reasons to errors (like invalid credentials should be handled differently)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch tax codes from Avatax",
      });
    });
  }),
});
