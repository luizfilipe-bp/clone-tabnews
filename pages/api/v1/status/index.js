import database from "infra/database.js";

async function status(request, response) {
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

  return response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: databaseMaxConnections,
        opened_connections: databaseOpenedConnections,
      },
    },
  });
}

export default status;
