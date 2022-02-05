import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import like from '@functions/like';
import getLike from '@functions/get-like';

import tables from './resources/dynamodb-tables';

const serverlessConfiguration: AWS = {
  service: 'dev-log-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-domain-manager'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-central-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      LIKE_TABLE: '${self:custom.like_table}',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:DescribeTable',
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem'
            ],
            Resource: [
              { "Fn::GetAtt": ['LikeTable', 'Arn'] }
            ]
          }
        ]
      },
    },
  },
  resources: {
    Resources: { ...tables },
  },
  // import the function via paths
  functions: { hello, like, getLike },
  package: { individually: true },
  custom: {
    customDomain: {
      domainName: 'api.gehhilfe.dev',
      basePath: '${self:provider.stage}',
      stage: '${self:provider.stage}',
      createRoute53Record: true,
    },
    table_throughputs: {
      prod: 5,
      default: 1,
    },
    region: '${opt:region, self:provider.region}',
    stage: '${opt:stage, self:provider.stage}',
    table_throughput: '${self:custom.TABLE_THROUGHPUTS.${self:custom.stage}, self:custom.table_throughputs.default}',
    like_table: '${self:service}-like-table-${opt:stage, self:provider.stage}',
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
