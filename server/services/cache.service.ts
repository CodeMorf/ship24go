/**
 * High-performance In-Memory TTL Cache Service
 * Provides sub-millisecond retrieval (< 1ms) for repetitive queries,
 * Google Places API autocomplete results, and quote calculations.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxItems: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxItems = 10000) {
    this.maxItems = maxItems;
    // Periodic sweep every 5 minutes to release expired memory
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  public get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  public set<T = any>(key: string, value: T, ttlSeconds: number = 300): void {
    if (this.cache.size >= this.maxItems) {
      // Evict the first 10% oldest entries (FIFO/LRU fallback)
      const keysToDelete = Array.from(this.cache.keys()).slice(0, Math.floor(this.maxItems * 0.1));
      keysToDelete.forEach((k) => this.cache.delete(k));
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public del(key: string): boolean {
    return this.cache.delete(key);
  }

  public flush(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(1) + '%' : '0%';
    return {
      size: this.cache.size,
      maxItems: this.maxItems,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Specialized helpers
  public async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  public getPlacesCache(query: string, country: string) {
    const normalized = `${query.trim().toLowerCase()}::${(country || '').trim().toLowerCase()}`;
    return this.get(`places:${normalized}`);
  }

  public setPlacesCache(query: string, country: string, result: any) {
    const normalized = `${query.trim().toLowerCase()}::${(country || '').trim().toLowerCase()}`;
    // Cache Google Places autocomplete for 24 hours (86,400 seconds)
    this.set(`places:${normalized}`, result, 86400);
  }

  public getQuoteKey(payload: any): string {
    const origin = `${payload.fromCountry || ''}_${payload.fromZip || ''}`;
    const dest = `${payload.toCountry || ''}_${payload.toZip || ''}`;
    const weight = Math.round(Number(payload.weight || payload.totalWeight || 1) * 10) / 10;
    const length = Math.round(Number(payload.length || 0));
    const width = Math.round(Number(payload.width || 0));
    const height = Math.round(Number(payload.height || 0));
    const currency = payload.currency || 'EUR';
    return `quote:${origin}->${dest}_w${weight}_${length}x${width}x${height}_${currency}`;
  }
}

export const cacheService = new CacheService(20000);
