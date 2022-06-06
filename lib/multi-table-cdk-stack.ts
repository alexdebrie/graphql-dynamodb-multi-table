import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, Schema } from "@aws-cdk/aws-appsync-alpha";
import { CfnApiKey } from 'aws-cdk-lib/aws-appsync';

export class MultiTableCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sitesTable = new Table(this, "SitesTable", {
      partitionKey: { name: "domain", type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    const postsTable = new Table(this, "PostsTable", {
      partitionKey: { name: "siteId", type: AttributeType.STRING},
      sortKey: { name: "publishDate", type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    const commentsTable = new Table(this, "CommentsTable", {
      partitionKey: { name: "postId", type: AttributeType.STRING},
      sortKey: { name: "publishDate", type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
    })

    const api = new GraphqlApi(this, 'Api', {
      name: 'DynamoDBMultiTable',
      schema: Schema.fromAsset('lib/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY
        }
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL
      },
      xrayEnabled: true
    })

    const sitesDatasource = api.addDynamoDbDataSource('SitesTable', sitesTable)
    const postsDatasource = api.addDynamoDbDataSource('PostsTable', postsTable)
    const commentsDatasource = api.addDynamoDbDataSource('CommentsTable', commentsTable)

    sitesDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createSite',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createSite.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createSite.response.vtl'),
    })

    sitesDatasource.createResolver({
      typeName: 'Query',
      fieldName: 'getSite',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getSite.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getSite.response.vtl'),
    })

    postsDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createPost',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createPost.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createPost.response.vtl'),
    })

    postsDatasource.createResolver({
      typeName: 'Query',
      fieldName: 'getPostsForSite',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getPostsForSite.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getPostsForSite.response.vtl'),
    })

    postsDatasource.createResolver({
      typeName: 'Site',
      fieldName: 'posts',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Site.posts.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Site.posts.response.vtl'),
    })

    commentsDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createComment',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createComment.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createComment.response.vtl'),
    })

    commentsDatasource.createResolver({
      typeName: 'Post',
      fieldName: 'comments',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Post.comments.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Post.comments.response.vtl'),
    })

    const apiKey = new CfnApiKey(this, 'GraphQLApiKey', {
      apiId: api.apiId
    })

    new CfnOutput(this, 'GraphQLURLOutput', {
      value: api.graphqlUrl,
      exportName: 'GraphQLURL'
    })

    new CfnOutput(this, 'GraphQLApiKeyOutput', {
      value: apiKey.attrApiKey,
      exportName: 'GraphQLApiKey'
    })


  }
}
