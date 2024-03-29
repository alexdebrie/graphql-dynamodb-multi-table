import { util } from "@aws-appsync/utils";

/**
 * Puts an item into the DynamoDB table using an auto-generated ID.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBPutItemRequest} the request
 */
export function request(ctx) {
  const { siteId, publishDate, ...params} = ctx.arguments.input;
  
  params.id = util.autoId();
  
  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({ siteId: siteId, publishDate: publishDate || util.time.nowISO8601() }),
    attributeValues: util.dynamodb.toMapValues(params),
    condition: {
      expression: "attribute_not_exists(#title)", // If your primary key consists of both a partition key(pk) and a sort key(sk), the parameter will check whether attribute_not_exists(pk) AND attribute_not_exists(sk) evaluate to true or false before attempting the write operation.
      expressionNames: { 
          "#title": "title" 
      }
    }
  };
}

/**
 * Returns the item or throws an error if the operation failed
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the inserted item
 */
export function response(ctx) {
  if (ctx.error) {
    if(ctx.error.type === 'DynamoDB:ConditionalCheckFailedException') {
      util.error("Error creating Post.", "PostAlreadyExistsError");
    } 
    else {
        util.error(ctx.error.message, ctx.error.type);
    }
  }
  
  return ctx.result;
}

