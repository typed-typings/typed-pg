import { EventEmitter } from 'events';
import { ConnectOptions } from 'tls';
import Pool = require('pg-pool');

export type ClientConstructor = new (connection: string | Config) => Client;
export type QueryCallback = (err: Error, result: ResultSet) => void;
export type ClientConnectCallback = (err: Error, client: Client) => void;
export type ConnectCallback = (err: Error, client: Client, done: DoneCallback) => void;
export type DoneCallback = (err?: Error) => void;

export interface ResultSet {
  rows: any[];
}

export interface QueryConfig {
  name?: string;
  text: string;
  values?: any[];
}

export interface Config {
  host?: string;
  user?: string;
  database?: string;
  password?: string;
  port?: number;
  poolSize?: number;
  rows?: number;
  binary?: boolean;
  poolIdleTimeout?: number;
  reapIntervalMillis?: number;
  poolLog?: boolean;
  client_encoding?: string;
  ssl?: boolean | ConnectOptions;
  application_name?: string;
  fallback_application_name?: string;
  parseInputDatesAsUTC?: boolean;
}

export interface ResultBuilder {
  command: string;
  rowCount: number;
  oid: number;
  rows: any[];
  addRow(row: any): void;
}

export class Query extends EventEmitter {
  text: string;
  rows: { [column: string]: any }[];
  values: any[];

  on(event: 'row', listener: (row: any, result: ResultBuilder) => void): this;
  on(event: 'end', listener: (result: ResultBuilder) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: string, listener: Function): this;
}

export class Client extends EventEmitter {
  constructor(config?: string | Config);

  user: string;
  database: string;
  port: string;
  host: string;
  password: string;
  binary: boolean;
  encoding: string;
  ssl: boolean;

  query(query: QueryConfig, callback?: QueryCallback): Query;
  query(text: string, callback?: QueryCallback): Query;
  query(text: string, values: any[], callback?: QueryCallback): Query;

  connect(callback?: ClientConnectCallback): void;
  end(): void;

  pauseDrain(): void;
  resumeDrain(): void;

  on(event: 'drain', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'notification', listener: (message: any) => void): this;
  on(event: 'notice', listener: (message: any) => void): this;
  on(event: string, listener: Function): this;
}

export { Pool };
export const defaults: Config;

/**
 * The following functions are used to convert a textual or binary
 * representation of a PostgreSQL result value into a JavaScript type.
 *
 * The oid can be obtained via the following sql query:
 *   `SELECT oid FROM pg_type WHERE typname = 'TYPE_NAME_HERE';`
 */
export namespace types {
  type TypeParserText = (value: string) => any;
  type TypeParserBinary = (value: Buffer) => any;

  export function getTypeParser(oid: number, format?: 'text'): TypeParserText;
  export function setTypeParser(oid: number, format: 'text', parseFn: TypeParserText): void;
  export function setTypeParser(oid: number, parseFn: TypeParserText): void;

  export function getTypeParser(oid: number, format: 'binary'): TypeParserBinary;
  export function setTypeParser(oid: number, format: 'binary', parseFn: TypeParserBinary): void;
}
