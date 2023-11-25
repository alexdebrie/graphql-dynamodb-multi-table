import { util } from "@aws-appsync/utils";

/**
 * Puts an item into the DynamoDB table using an auto-generated ID.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBPutItemRequest} the request
 */
export function request(ctx) {
  const { domain, ...params} = ctx.arguments.input;
  
  params.id = util.autoId()  
  
  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({ domain: domain }),
    attributeValues: util.dynamodb.toMapValues(params),
    condition: {
      expression: "attribute_not_exists(#domain)",
      expressionNames: { "#domain": "domain" }
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
      util.error('Domain already exists', 'DomainAlreadyExists');
    } 
    else {
        util.error(ctx.error.message, ctx.error.type);
    }
  }
  
  return ctx.result;
}

