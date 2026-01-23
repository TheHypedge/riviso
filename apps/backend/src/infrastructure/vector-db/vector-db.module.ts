import { Module, Global } from '@nestjs/common';
import { VectorDbService } from './vector-db.service';

/**
 * Vector database module
 * Provides abstraction over vector databases like Pinecone, Weaviate, etc.
 */
@Global()
@Module({
  providers: [VectorDbService],
  exports: [VectorDbService],
})
export class VectorDbModule {}
