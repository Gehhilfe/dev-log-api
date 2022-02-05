import * as AWS from 'aws-sdk';

const documentClient = new AWS.DynamoDB.DocumentClient();

export const createCounterIfNotExits = async (counter: string) => {
  // check if ctr exists
  const existRequest: AWS.DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.LIKE_TABLE,
    Key: {
      id: counter
    }
  }
  const resp = await documentClient.get(existRequest).promise();
  if (resp.Item == undefined) {
    const putRequest: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.LIKE_TABLE,
      Item: {
        id: counter,
        ctr: 0
      },
    }
    await documentClient.put(putRequest).promise();
  }
}

export const getCount = async (counter: string): Promise<number> => {
  const getRequest: AWS.DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.LIKE_TABLE,
    Key: {
      id: counter
    }
  }
  const resp = await documentClient.get(getRequest).promise();
  return resp.Item.ctr;
}

export const incrementCounter = async (counter: string, limit: number): Promise<[number, boolean]> => {
  const update: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
    Key: {
      id: counter
    },
    TableName: process.env.LIKE_TABLE,
    UpdateExpression: "set ctr = ctr + :val",
    ExpressionAttributeValues: {
      ":val": 1
    },
    ReturnValues: "UPDATED_NEW"
  }
  if (limit != 0) {
    update.ConditionExpression = "ctr < :limit"
    update.ExpressionAttributeValues = {
      ...update.ExpressionAttributeValues,
      ":limit": limit,
    }
  }

  try {
    const resp = await documentClient.update(update).promise();
    if (resp.Attributes) {
      return [resp.Attributes.ctr, true];
    }
    return [1, true];
  } catch (error) {
    return [limit, false];
  }
}