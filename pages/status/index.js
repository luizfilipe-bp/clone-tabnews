import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status Page</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização: {updatedAtText} </div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let database = "Carregando ...";

  if (!isLoading && data) {
    const databaseText = data.dependencies.database;

    database = (
      <>
        <div>
          <div>Versão: {databaseText.version}</div>
          <div>Máximo de conexões: {databaseText.max_connections}</div>
          <div>Conexões abertas: {databaseText.opened_connections}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2>Banco de dados</h2>
      <div>{database}</div>
    </>
  );
}
