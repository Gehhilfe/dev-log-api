import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { createCounterIfNotExits, getCount, incrementCounter } from "@libs/counter";
import { middyfy } from "@libs/lambda";

import schema from "./schema";



const countLike = async (pageCtr: string, clientCtr: string): Promise<Array<number>> => {
  const clientResp = await incrementCounter(clientCtr, 10);
  var pageCount = 0;
  if (clientResp[1] == true) {
    pageCount = (await incrementCounter(pageCtr, 0))[0];
  } else {
    pageCount = await getCount(pageCtr);
  }

  return [pageCount, clientResp[0]]
}

const like: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const pageCtr = event.body.id;
  const clientCtr = event.body.id + "|" + event.body.client;
  const ctrs = [pageCtr, clientCtr];

  await Promise.all(ctrs.map(it => createCounterIfNotExits(it)));
  const state = await countLike(pageCtr, clientCtr);
  return formatJSONResponse({
    totalCount: state[0],
    clientCount: state[1]
  })
}

export const main = middyfy(like);