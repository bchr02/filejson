// Type definitions for filejson
// Project: https://github.com/bchr02/filejson
// Definitions by: Bill Christo

declare namespace Filejson {
  interface Config {
    /**
     * Default filename to use (can be overridden in load())
     */
    filename?: string;

    /**
     * Number of spaces for JSON indentation (default: 2)
     */
    space?: number;

    /**
     * Enable verbose logging (default: false)
     */
    verbose?: boolean;

    /**
     * Milliseconds to wait before saving after a change (default: 100ms)
     */
    saveDelay?: number;

    /**
     * Enable atomic writes for crash safety (default: true)
     */
    atomicWrites?: boolean;

    /**
     * When true, automatically creates the file with an empty object ({})
     * if it does not exist instead of throwing an ENOENT error (default: false)
     */
    createIfMissing?: boolean;
  }

  interface FilejsonInstance<T = any> {
    /**
     * Configuration options
     */
    cfg: Required<Config>;

    /**
     * The JavaScript value that is automatically synced to the JSON file
     */
    contents: T;

    /**
     * Boolean flag to temporarily pause automatic saving
     */
    paused: boolean;

    /**
     * Loads a JSON file and sets up automatic syncing
     * @param filename Path to the JSON file
     * @param callback Callback function (error, instance)
     */
    load(filename: string, callback: (error: string | null, instance: this) => void): void;

    /**
     * Loads a JSON file and sets up automatic syncing
     * @param filename Path to the JSON file
     * @param overwriteWith Initial data to overwrite the file with
     * @param callback Callback function (error, instance)
     */
    load<U = T>(filename: string, overwriteWith: U, callback: (error: string | null, instance: FilejsonInstance<U>) => void): void;

    /**
     * Loads a JSON file and sets up automatic syncing (Promise API)
     * @param filename Path to the JSON file
     * @returns Promise that resolves with the instance
     */
    load(filename: string): Promise<this>;

    /**
     * Loads a JSON file and sets up automatic syncing (Promise API)
     * @param filename Path to the JSON file
     * @param overwriteWith Initial data to overwrite the file with
     * @returns Promise that resolves with the instance
     */
    load<U = T>(filename: string, overwriteWith: U): Promise<FilejsonInstance<U>>;

    /**
     * Manually saves the current contents to disk (callback API)
     * @param callback Callback function (error, instance)
     */
    save(callback: (error: Error | null, instance: this) => void): void;

    /**
     * Manually saves the current contents to disk (Promise API)
     * @returns Promise that resolves with the instance
     */
    save(): Promise<this>;

    /**
     * Synchronously saves the current contents to disk.
     * Useful for exit handlers where async operations may not complete.
     * @returns The Filejson instance
     * @throws Error if serialization or file write fails
     */
    saveSync(): this;
  }
}

/**
 * Creates a new Filejson instance for automatic JSON file persistence
 * @param config Optional configuration options
 */
declare class Filejson<T = any> {
  constructor(config?: Filejson.Config);

  /**
   * Configuration options
   */
  cfg: Required<Filejson.Config>;

  /**
   * The JavaScript value that is automatically synced to the JSON file
   */
  contents: T;

  /**
   * Boolean flag to temporarily pause automatic saving
   */
  paused: boolean;

  /**
   * Loads a JSON file and sets up automatic syncing
   * @param filename Path to the JSON file
   * @param callback Callback function (error, instance)
   */
  load(filename: string, callback: (error: string | null, instance: this) => void): void;

  /**
   * Loads a JSON file and sets up automatic syncing
   * @param filename Path to the JSON file
   * @param overwriteWith Initial data to overwrite the file with
   * @param callback Callback function (error, instance)
   */
  load<U = T>(filename: string, overwriteWith: U, callback: (error: string | null, instance: Filejson<U>) => void): void;

  /**
   * Loads a JSON file and sets up automatic syncing (Promise API)
   * @param filename Path to the JSON file
   * @returns Promise that resolves with the instance
   */
  load(filename: string): Promise<this>;

  /**
   * Loads a JSON file and sets up automatic syncing (Promise API)
   * @param filename Path to the JSON file
   * @param overwriteWith Initial data to overwrite the file with
   * @returns Promise that resolves with the instance
   */
  load<U = T>(filename: string, overwriteWith: U): Promise<Filejson<U>>;

  /**
   * Manually saves the current contents to disk (callback API)
   * @param callback Callback function (error, instance)
   */
  save(callback: (error: Error | null, instance: this) => void): void;

  /**
   * Manually saves the current contents to disk (Promise API)
   * @returns Promise that resolves with the instance
   */
  save(): Promise<this>;

  /**
   * Synchronously saves the current contents to disk.
   * Useful for exit handlers where async operations may not complete.
   * @returns The Filejson instance
   * @throws Error if serialization or file write fails
   */
  saveSync(): this;
}

export { Filejson };
export default Filejson;
