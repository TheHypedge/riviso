import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GSCConnection } from './gsc.service';

@Injectable()
export class GscConnectionStore {
  private readonly logger = new Logger(GscConnectionStore.name);
  private readonly filePath: string;

  constructor() {
    // Store in data directory (same as user integrations)
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'gsc_connections.json');
    this.logger.log(`GSC connections will be stored at: ${this.filePath}`);
  }

  /**
   * Load all GSC connections from file
   */
  loadConnections(): Map<string, GSCConnection> {
    const connections = new Map<string, GSCConnection>();

    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // Convert array/object to Map
        if (Array.isArray(data)) {
          data.forEach((conn: GSCConnection) => {
            connections.set(conn.userId, conn);
          });
        } else if (typeof data === 'object') {
          Object.entries(data).forEach(([userId, conn]: [string, any]) => {
            connections.set(userId, conn as GSCConnection);
          });
        }
        
        this.logger.log(`Loaded ${connections.size} GSC connection(s) from file`);
      } else {
        this.logger.log('No existing GSC connections file found, starting fresh');
      }
    } catch (error: any) {
      this.logger.warn(`Failed to load GSC connections: ${error?.message}`);
    }

    return connections;
  }

  /**
   * Save all GSC connections to file
   */
  saveConnections(connections: Map<string, GSCConnection>): void {
    try {
      // Convert Map to array for JSON serialization
      const connectionsArray = Array.from(connections.values());
      
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(connectionsArray, null, 2),
        'utf-8',
      );
      
      this.logger.log(`Saved ${connectionsArray.length} GSC connection(s) to file`);
    } catch (error: any) {
      this.logger.error(`Failed to save GSC connections: ${error?.message}`);
    }
  }

  /**
   * Save a single connection (loads, updates, saves)
   */
  saveConnection(userId: string, connection: GSCConnection): void {
    const connections = this.loadConnections();
    connections.set(userId, connection);
    this.saveConnections(connections);
  }

  /**
   * Delete a connection
   */
  deleteConnection(userId: string): void {
    const connections = this.loadConnections();
    connections.delete(userId);
    this.saveConnections(connections);
  }
}
