import { util } from "@aws-appsync/utils";

/**
 * Puts an item into the DynamoDB table using an auto-generated ID.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBPutItemRequest} the request
 */
export function request(ctx) {
  const { id, domain, name, ...values} = ctx.arguments.input;
  
  ctx.arguments.input.id = util.autoId()  
  
  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({ domain: ctx.arguments.input.domain }),
    attributeValues: util.dynamodb.toMapValues(ctx.arguments.input),
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

