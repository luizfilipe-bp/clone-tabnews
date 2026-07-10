import database from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SELECT current_setting('max_connections') as max_connections;",
  );
  const databaseMaxConnections = parseInt(
    databaseMaxConnectionsResult.rows[0].max_connections,
  );

  const text =
    "SELECT COUNT(*)::int as opened_connections FROM pg_stat_activity WHERE datname = $1;";
  const values = [process.env.POSTGRES_DB];

  const databaseOpenedConnectionsResult = await database.query({
    text,
    values,
  });

  const databaseOpenedConnections =
    databaseOpenedConnectionsResult.rows[0].opened_connections;

  const statusObject = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: databaseMaxConnections,
        opened_connections: databaseOpenedConnections,
      },
    },
  };

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    statusObject,
  );

  return response.status(200).json(secureOutputValues);
}
