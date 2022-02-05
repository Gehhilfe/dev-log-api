import { formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { getCount } from "@libs/counter";
import { middyfy } from "@libs/lambda";

const getLike: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  if (event.queryStringParameters == null) {
    return formatErrorResponse(400, "Missing query parameters")
  }
  if (event.queryStringParameters.id == null) {
    return formatErrorResponse(400, "Missing id query parameter")
  }
  var totalCount = 0;
  try {
    totalCount = await getCount(event.queryStringParameters.id);
  }catch {}
  return formatJSONResponse({
    totalCount: totalCount
  });
}

export const main = middyfy(getLike);