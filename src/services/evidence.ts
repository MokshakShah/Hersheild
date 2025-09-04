export interface EvidenceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface Evidence {
  id: string;
  type: 'photo' | 'audio';
  dataUri: string;
  timestamp: string;
  createdAt: number; // Unix timestamp for automatic deletion
  location: EvidenceLocation | null;
  size: number; // Size in bytes for storage management
}

class EvidenceService {
  private readonly STORAGE_KEY = 'savedEvidence';
  private activeUserKey: string = '';
  private readonly MAX_AGE_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds
  private readonly MAX_STORAGE_SIZE = 100 * 1024 * 1024; // 100MB max storage
  private readonly COMPRESSION_QUALITY = 0.7; // JPEG compression quality
  private readonly MAX_IMAGE_DIMENSION = 1024; // Max image dimension
  private cleanupScheduled = false;
  private performanceStats = {
    totalSaves: 0,
    averageSaveTime: 0,
    totalOptimizations: 0,
    averageOptimizationTime: 0
  };

  // Build a per-user storage key to isolate evidence by account
  private getStorageKey(): string {
    return this.activeUserKey
      ? `${this.STORAGE_KEY}:${this.activeUserKey}`
      : this.STORAGE_KEY;
  }

  // Allow the app to set the current user for namespaced storage
  setUserKey(userKey: string | null | undefined) {
    this.activeUserKey = (userKey ?? '').trim();
  }

  // Performance monitoring
  private logPerformance(operation: string, startTime: number) {
    const duration = Date.now() - startTime;
    console.log(`Evidence Service - ${operation}: ${duration}ms`);
    
    if (operation === 'save') {
      this.performanceStats.totalSaves++;
      this.performanceStats.averageSaveTime = 
        (this.performanceStats.averageSaveTime * (this.performanceStats.totalSaves - 1) + duration) / this.performanceStats.totalSaves;
    } else if (operation === 'optimize') {
      this.performanceStats.totalOptimizations++;
      this.performanceStats.averageOptimizationTime = 
        (this.performanceStats.averageOptimizationTime * (this.performanceStats.totalOptimizations - 1) + duration) / this.performanceStats.totalOptimizations;
    }
  }

  // Fast image optimization without blocking
  async optimizeImage(dataUri: string): Promise<{ dataUri: string; size: number }> {
    return new Promise((resolve) => {
      // For immediate response, start with original and optimize in background
      const originalSize = this.calculateDataUriSize(dataUri);
      
      // If image is already small enough, return immediately
      if (originalSize < 500 * 1024) { // Less than 500KB
        resolve({ dataUri, size: originalSize });
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve({ dataUri, size: originalSize });
            return;
          }
          
          // Calculate optimal dimensions
          let { width, height } = img;
          if (width > this.MAX_IMAGE_DIMENSION || height > this.MAX_IMAGE_DIMENSION) {
            const scale = Math.min(this.MAX_IMAGE_DIMENSION / width, this.MAX_IMAGE_DIMENSION / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Use high-quality image processing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to optimized JPEG
          const optimizedDataUri = canvas.toDataURL('image/jpeg', this.COMPRESSION_QUALITY);
          const size = this.calculateDataUriSize(optimizedDataUri);
          
          resolve({ dataUri: optimizedDataUri, size });
        } catch (error) {
          console.error('Image optimization error:', error);
          resolve({ dataUri, size: originalSize });
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image for optimization');
        resolve({ dataUri, size: originalSize });
      };
      
      img.src = dataUri;
    });
  }

  // Fast audio processing - just calculate size
  async optimizeAudio(dataUri: string): Promise<{ dataUri: string; size: number }> {
    const size = this.calculateDataUriSize(dataUri);
    return { dataUri, size };
  }

  private calculateDataUriSize(dataUri: string): number {
    try {
      // Estimate size from base64 data URI
      const base64 = dataUri.split(',')[1];
      if (!base64) return 0;
      return Math.ceil((base64.length * 3) / 4);
    } catch (error) {
      console.error('Error calculating data URI size:', error);
      return 0;
    }
  }

  // Fast save evidence - minimal blocking operations
  async saveEvidence(type: 'photo' | 'audio', dataUri: string, location: EvidenceLocation | null): Promise<Evidence> {
    const startTime = Date.now();
    try {
      // Create evidence immediately with original data
      const evidence: Evidence = {
        id: new Date().toISOString(),
        type,
        dataUri,
        timestamp: new Date().toLocaleString(),
        createdAt: Date.now(),
        location,
        size: this.calculateDataUriSize(dataUri)
      };

      // Save immediately to localStorage
      const savedEvidence = this.getEvidence();
      savedEvidence.unshift(evidence);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(savedEvidence));

      // Schedule background optimization and cleanup
      this.scheduleBackgroundOptimization(evidence.id, type, dataUri);
      this.scheduleBackgroundCleanup();

      this.logPerformance('save', startTime);
      return evidence;
    } catch (error) {
      console.error('Failed to save evidence:', error);
      throw new Error(`Failed to save ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Background optimization - doesn't block the UI
  private async scheduleBackgroundOptimization(evidenceId: string, type: 'photo' | 'audio', originalDataUri: string) {
    // Use setTimeout to run in background
    setTimeout(async () => {
      const startTime = Date.now();
      try {
        let optimizedDataUri: string;
        let size: number;

        if (type === 'photo') {
          const result = await this.optimizeImage(originalDataUri);
          optimizedDataUri = result.dataUri;
          size = result.size;
        } else {
          const result = await this.optimizeAudio(originalDataUri);
          optimizedDataUri = result.dataUri;
          size = result.size;
        }

        // Update the evidence with optimized data
        const savedEvidence = this.getEvidence();
        const evidenceIndex = savedEvidence.findIndex(item => item.id === evidenceId);
        
        if (evidenceIndex !== -1) {
          savedEvidence[evidenceIndex].dataUri = optimizedDataUri;
          savedEvidence[evidenceIndex].size = size;
          localStorage.setItem(this.getStorageKey(), JSON.stringify(savedEvidence));
          console.log(`Background optimization completed for ${type} ${evidenceId}`);
        }
        
        this.logPerformance('optimize', startTime);
      } catch (error) {
        console.error('Background optimization failed:', error);
      }
    }, 100); // Small delay to ensure UI is not blocked
  }

  // Background cleanup - doesn't block the UI
  private scheduleBackgroundCleanup() {
    if (this.cleanupScheduled) return;
    
    this.cleanupScheduled = true;
    setTimeout(async () => {
      try {
        await this.cleanupOldEvidence();
        await this.enforceStorageLimits();
        this.cleanupScheduled = false;
      } catch (error) {
        console.error('Background cleanup failed:', error);
        this.cleanupScheduled = false;
      }
    }, 500); // Small delay to ensure UI is not blocked
  }

  // Get all evidence
  getEvidence(): Evidence[] {
    try {
      const saved = localStorage.getItem(this.getStorageKey());
      if (!saved) return [];
      
      const evidence: Evidence[] = JSON.parse(saved);
      
      // Filter out expired evidence
      const now = Date.now();
      const validEvidence = evidence.filter(item => (now - item.createdAt) < this.MAX_AGE_MS);
      
      // Update localStorage if some items were expired
      if (validEvidence.length !== evidence.length) {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(validEvidence));
        console.log(`Cleaned up ${evidence.length - validEvidence.length} expired evidence items`);
      }
      
      return validEvidence;
    } catch (error) {
      console.error('Error reading evidence:', error);
      return [];
    }
  }

  // Delete specific evidence
  deleteEvidence(id: string): boolean {
    try {
      const evidence = this.getEvidence();
      const updatedEvidence = evidence.filter(item => item.id !== id);
      
      if (updatedEvidence.length !== evidence.length) {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(updatedEvidence));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting evidence:', error);
      return false;
    }
  }

  // Delete all evidence
  deleteAllEvidence(): boolean {
    try {
      localStorage.removeItem(this.getStorageKey());
      return true;
    } catch (error) {
      console.error('Error deleting all evidence:', error);
      return false;
    }
  }

  // Clean up expired evidence
  async cleanupOldEvidence(): Promise<void> {
    try {
      const evidence = this.getEvidence();
      const now = Date.now();
      const validEvidence = evidence.filter(item => (now - item.createdAt) < this.MAX_AGE_MS);
      
      if (validEvidence.length !== evidence.length) {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(validEvidence));
        console.log(`Cleaned up ${evidence.length - validEvidence.length} expired evidence items`);
      }
    } catch (error) {
      console.error('Error cleaning up old evidence:', error);
    }
  }

  // Manual cleanup trigger for UI
  async manualCleanup(): Promise<void> {
    await this.cleanupOldEvidence();
    await this.enforceStorageLimits();
  }

  // Enforce storage limits
  private async enforceStorageLimits(): Promise<void> {
    try {
      const evidence = this.getEvidence();
      let totalSize = evidence.reduce((sum, item) => sum + (item.size || 0), 0);
      
      // If over limit, remove oldest items
      if (totalSize > this.MAX_STORAGE_SIZE) {
        const sortedEvidence = evidence.sort((a, b) => a.createdAt - b.createdAt);
        const evidenceToKeep: Evidence[] = [];
        
        for (const item of sortedEvidence) {
          if (totalSize <= this.MAX_STORAGE_SIZE) {
            evidenceToKeep.push(item);
          } else {
            totalSize -= (item.size || 0);
          }
        }
        
        localStorage.setItem(this.getStorageKey(), JSON.stringify(evidenceToKeep));
        console.log(`Storage limit exceeded, removed ${evidence.length - evidenceToKeep.length} oldest items`);
      }
    } catch (error) {
      console.error('Error enforcing storage limits:', error);
    }
  }

  // Get storage statistics
  getStorageStats(): { totalItems: number; totalSize: number; maxSize: number; oldestItem: number | null } {
    try {
      const evidence = this.getEvidence();
      const totalSize = evidence.reduce((sum, item) => sum + (item.size || 0), 0);
      const oldestItem = evidence.length > 0 ? Math.min(...evidence.map(item => item.createdAt)) : null;
      
      return {
        totalItems: evidence.length,
        totalSize,
        maxSize: this.MAX_STORAGE_SIZE,
        oldestItem
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        maxSize: this.MAX_STORAGE_SIZE,
        oldestItem: null
      };
    }
  }

  // Get performance statistics (for debugging)
  getPerformanceStats() {
    return { ...this.performanceStats };
  }

  // Schedule automatic cleanup (run this periodically)
  scheduleCleanup(): void {
    try {
      // Clean up every hour
      setInterval(() => {
        this.cleanupOldEvidence();
      }, 60 * 60 * 1000);
    } catch (error) {
      console.error('Error scheduling cleanup:', error);
    }
  }
}

// Export singleton instance
export const evidenceService = new EvidenceService();

// Initialize cleanup scheduling
if (typeof window !== 'undefined') {
  try {
    evidenceService.scheduleCleanup();
  } catch (error) {
    console.error('Error initializing evidence service:', error);
  }
}
