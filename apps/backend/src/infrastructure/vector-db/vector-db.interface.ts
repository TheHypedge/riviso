/**
 * Vector database abstraction interface
 * Supports multiple vector database providers (Pinecone, Weaviate, Qdrant, etc.)
 */

export interface VectorDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export interface VectorSearchQuery {
  query: string;
  embedding?: number[];
  topK?: number;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
}

/**
 * Vector database interface that all providers must implement
 */
export interface IVectorDatabase {
  /**
   * Initialize connection to vector database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from vector database
   */
  disconnect(): Promise<void>;

  /**
   * Upsert (insert or update) documents
   */
  upsert(documents: VectorDocument[]): Promise<void>;

  /**
   * Search for similar documents
   */
  search(query: VectorSearchQuery): Promise<VectorSearchResult[]>;

  /**
   * Get document by ID
   */
  get(id: string): Promise<VectorDocument | null>;

  /**
   * Delete documents by IDs
   */
  delete(ids: string[]): Promise<void>;

  /**
   * Delete all documents matching filter
   */
  deleteByFilter(filter: Record<string, any>): Promise<void>;

  /**
   * Get collection statistics
   */
  getStats(): Promise<{
    totalDocuments: number;
    dimensions: number;
  }>;
}

/**
 * Configuration interface for vector database
 */
export interface VectorDatabaseConfig {
  provider: 'pinecone' | 'weaviate' | 'qdrant' | 'milvus';
  apiKey?: string;
  url?: string;
  indexName: string;
  dimensions: number;
  metric?: 'cosine' | 'euclidean' | 'dot';
}
