import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

/**
 * OpenSearch service for search and analytics
 */
@Injectable()
export class OpenSearchService implements OnModuleInit {
  private readonly logger = new Logger(OpenSearchService.name);
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      node: `http://${this.configService.get('OPENSEARCH_HOST', 'localhost')}:${this.configService.get('OPENSEARCH_PORT', 9200)}`,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async onModuleInit() {
    try {
      const health = await this.client.cluster.health();
      this.logger.log(`OpenSearch cluster status: ${health.body.status}`);
    } catch (error) {
      this.logger.warn(
        `Could not connect to OpenSearch: ${error.message}. Continuing without OpenSearch.`,
      );
    }
  }

  /**
   * Index a document
   */
  async index(index: string, id: string, document: any): Promise<any> {
    try {
      const response = await this.client.index({
        index,
        id,
        body: document,
        refresh: true,
      });
      return response.body;
    } catch (error) {
      this.logger.error(`Error indexing document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search documents
   */
  async search(index: string, query: any): Promise<any> {
    try {
      const response = await this.client.search({
        index,
        body: query,
      });
      return response.body.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      this.logger.error(`Error searching: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async get(index: string, id: string): Promise<any> {
    try {
      const response = await this.client.get({
        index,
        id,
      });
      return response.body._source;
    } catch (error) {
      this.logger.error(`Error getting document: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete document
   */
  async delete(index: string, id: string): Promise<boolean> {
    try {
      await this.client.delete({
        index,
        id,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`);
      return false;
    }
  }

  /**
   * Create index with mapping
   */
  async createIndex(index: string, mappings: any): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index });

      if (!exists.body) {
        await this.client.indices.create({
          index,
          body: {
            mappings,
          },
        });
        this.logger.log(`Index ${index} created successfully`);
      }
    } catch (error) {
      this.logger.error(`Error creating index: ${error.message}`);
    }
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(index: string, documents: any[]): Promise<any> {
    try {
      const body = documents.flatMap((doc) => [
        { index: { _index: index, _id: doc.id } },
        doc,
      ]);

      const response = await this.client.bulk({
        refresh: true,
        body,
      });

      return response.body;
    } catch (error) {
      this.logger.error(`Error bulk indexing: ${error.message}`);
      throw error;
    }
  }

  /**
   * Aggregate data
   */
  async aggregate(index: string, aggregations: any): Promise<any> {
    try {
      const response = await this.client.search({
        index,
        body: {
          size: 0,
          aggs: aggregations,
        },
      });

      return response.body.aggregations;
    } catch (error) {
      this.logger.error(`Error aggregating: ${error.message}`);
      throw error;
    }
  }
}
