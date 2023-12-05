import * as ddb from "@aws-appsync/utils/dynamodb";

/**
 * Query for items in the DynamoDB table.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {

    const { after = null, num = 20 } = ctx.arguments;
    
    return ddb.query({
        query: { postId: { eq: ctx.source.id } },
        limit: num,
        nextToken: after,
  });
}


export function response(ctx) {
  const { items: comments = [], nextToken: cursor = null } = ctx.result;
  return { comments, cursor };
}
