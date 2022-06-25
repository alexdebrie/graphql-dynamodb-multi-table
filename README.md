## GraphQL + DynamoDB -- Multi-table example

This repository includes an example of building a GraphQL API with DynamoDB using multiple DynamoDB tables. It is intended to pair with [this guide on using DynamoDB in a GraphQL API](TODO).

## Usage

This application uses the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) to deploy a GraphQL API to [AWS AppSync](https://aws.amazon.com/appsync/). Be sure to [install and bootstrap the CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) before use.

To deploy, clone this repository and run the following commands:

```
npm i
cdk deploy
```

This will deploy an AppSync API and return the GraphQL root URL and an API key to access the API.

You can query the API in the AWS console, or you can open the [`index.html`](./index.html) file to use a local GraphQL explorer. Before opening the file, be sure to replace `GRAPHQL_ROOT` and `API_KEY` with the received values from your deploy.

## Application background

This sample application builds a portion of a SaaS blog hosting platform. Users create a Site on the platform and are able to create Posts on the site. Other users can view the Posts and attach a Comment to a Post.

The simplified ERD is below. This application includes the general CDK code and AppSync resolvers to demonstrate the key differences between single-table and multi-table design with GraphQL + DynamoDB.

![AppSync - ERD](https://user-images.githubusercontent.com/6509926/172209448-98350f3f-7fcf-4a7e-aa64-123dd59ab4e9.svg)

## Takeaways

- **This example creates a DynamoDB table for each entity.** Many DynamoDB applications and resources talk about single-table design where you use a single DynamoDB table for all entities in your application. Single-table design works well for known access patterns that fetch different types of entities in a single request. However, many GraphQL APIs allow for flexible, nested access of data where single-table design is less useful.

- **Multi-table design optimizes for simplicity over latency.** This example follows traditional GraphQL practices where each resolver is simple and focused on retrieving only the type requested but not any related sub-types. This means each resolver is easier to write and understand, but it can result in a waterfall of sequential queries to your database for complex GraphQL requests.

- **Multi-table design allows for a more normalized design.** With DynamoDB and single-table design, you often reduce the use of primary & foreign keys to identify relationships between items. Instead, you use attributes that will be known at query time to avoid making multiple, sequential requests.

  Because the GraphQL engine plans for sequential execution of resolvers, we can use normalized tables with IDs as pointers. This eases updates of attributes on parent items, such as the domain of the parent Site.
