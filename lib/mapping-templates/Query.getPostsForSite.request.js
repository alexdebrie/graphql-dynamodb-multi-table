import { util } from "@aws-appsync/utils";
import * as ddb from "@aws-appsync/utils/dynamodb";

/**
 * Query for items in the Post DynamoDB table.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request 123
 */
export function request(ctx) {
  const { after = null, num = 20, siteId } = ctx.arguments;

  return ddb.query({
    query: { siteId: { eq: siteId } },
    limit: num,
    nextToken: after,
  });
}

export function response(ctx) {
//   return { test: ctx };
  const { items: posts = [], nextToken: cursor = null } = ctx.result;
  return { posts, cursor };
}
