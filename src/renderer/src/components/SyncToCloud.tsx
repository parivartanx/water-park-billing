import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Cloud, CloudUpload, CloudDownload, RefreshCw, CheckCircle, AlertCircle, Loader2, ArrowUpDown } from 'lucide-react'

interface SyncProgress {
  total: number;
  completed: number;
  currentTable: string;
  status: 'syncing' | 'completed' | 'error';
}

interface SyncResult {
  success: boolean;
  message: string;
  progress?: SyncProgress;
  error?: string;
}

const SyncToCloud: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  const handleSyncUnifiedBillingOnly = async () => {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('You are not authenticated. Please log in.')
      return
    }

    setIsLoading(true)
    setSyncProgress(null)

    try {
      // Show initial progress for unified billing
      setSyncProgress({
        total: 1,
        completed: 0,
        currentTable: 'Syncing unified billing...',
        status: 'syncing'
      });
      toast.loading('Syncing unified billing to cloud...', { id: 'sync-toast' });

      const result = await window.electron.ipcRenderer.invoke('sync-unified-billing-only', {
        access_token
      }) as SyncResult

      if (result.success) {
        setSyncProgress(result.progress || null)
        toast.success(result.message, { id: 'sync-toast' })
        setLastSyncTime(new Date().toLocaleString())
      } else {
        setSyncProgress(result.progress || null)
        toast.error(result.error || result.message, { id: 'sync-toast' })
      }

    } catch (error) {
      console.error('Unified billing sync error:', error)
      toast.error('Failed to sync unified billing to cloud', { id: 'sync-toast' })
      setSyncProgress({
        total: 1,
        completed: 0,
        currentTable: 'Unified billing sync failed',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncToCloud = async () => {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('You are not authenticated. Please log in.')
      return
    }

    setIsLoading(true)
    setSyncProgress(null)

    try {
      // Show initial progress
      setSyncProgress({
        total: 11,
        completed: 0,
        currentTable: 'Initializing sync...',
        status: 'syncing'
      });

      toast.loading('Starting sync to cloud...', { id: 'sync-toast' });

      const result = await window.electron.ipcRenderer.invoke('force-sync-to-cloud', {
        access_token
      }) as SyncResult

      if (result.success) {
        setSyncProgress(result.progress || null)
        toast.success(result.message, { id: 'sync-toast' })
        setLastSyncTime(new Date().toLocaleString())
      } else {
        setSyncProgress(result.progress || null)
        toast.error(result.error || result.message, { id: 'sync-toast' })
      }

    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to sync data to cloud', { id: 'sync-toast' })
      setSyncProgress({
        total: 11,
        completed: 0,
        currentTable: 'Sync failed',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncFromCloud = async () => {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('You are not authenticated. Please log in.')
      return
    }

    setIsLoading(true)
    setSyncProgress(null)

    try {
      // Show initial progress
      setSyncProgress({
        total: 11,
        completed: 0,
        currentTable: 'Initializing cloud download...',
        status: 'syncing'
      });

      toast.loading('Starting sync from cloud...', { id: 'sync-toast' });

      const result = await window.electron.ipcRenderer.invoke('force-sync-from-cloud', {
        access_token
      }) as SyncResult

      if (result.success) {
        setSyncProgress(result.progress || null)
        toast.success(result.message, { id: 'sync-toast' })
        setLastSyncTime(new Date().toLocaleString())
      } else {
        setSyncProgress(result.progress || null)
        toast.error(result.error || result.message, { id: 'sync-toast' })
      }

    } catch (error) {
      console.error('Sync from cloud error:', error)
      toast.error('Failed to sync data from cloud', { id: 'sync-toast' })
      setSyncProgress({
        total: 11,
        completed: 0,
        currentTable: 'Cloud sync failed',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBidirectionalSync = async () => {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('You are not authenticated. Please log in.')
      return
    }

    setIsLoading(true)
    setSyncProgress(null)

    try {
      // Show initial progress - bidirectional has double the operations
      setSyncProgress({
        total: 22, // 11 databases × 2 operations each
        completed: 0,
        currentTable: 'Initializing bidirectional sync...',
        status: 'syncing'
      });

      toast.loading('Starting bidirectional sync...', { id: 'sync-toast' });

      const result = await window.electron.ipcRenderer.invoke('bidirectional-sync', {
        access_token
      }) as SyncResult

      if (result.success) {
        setSyncProgress(result.progress || null)
        toast.success(result.message, { id: 'sync-toast' })
        setLastSyncTime(new Date().toLocaleString())
      } else {
        setSyncProgress(result.progress || null)
        toast.error(result.error || result.message, { id: 'sync-toast' })
      }

    } catch (error) {
      console.error('Bidirectional sync error:', error)
      toast.error('Failed to perform bidirectional sync', { id: 'sync-toast' })
      setSyncProgress({
        total: 22,
        completed: 0,
        currentTable: 'Bidirectional sync failed',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckSyncStatus = async () => {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('You are not authenticated. Please log in.')
      return
    }

    try {
      const result = await window.electron.ipcRenderer.invoke('get-sync-status', {
        access_token
      }) as SyncResult

      if (result.success) {
        toast.success('Sync status retrieved successfully')
      } else {
        toast.error(result.error || 'Failed to get sync status')
      }
    } catch (error) {
      console.error('Sync status error:', error)
      toast.error('Failed to get sync status')
    }
  }

  const getProgressPercentage = () => {
    if (!syncProgress) return 0
    return Math.round((syncProgress.completed / syncProgress.total) * 100)
  }

  const getStatusIcon = () => {
    if (!syncProgress) return <Cloud className="w-6 h-6" />
    
    switch (syncProgress.status) {
      case 'syncing':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      default:
        return <Cloud className="w-6 h-6" />
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <CloudUpload className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cloud Sync</h2>
          <p className="text-gray-600">Sync all local data to cloud storage</p>
        </div>
      </div>

      {/* Sync Status Card */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-gray-700">
              {syncProgress ? syncProgress.currentTable : 'Ready to sync'}
            </span>
          </div>
          {lastSyncTime && (
            <span className="text-sm text-gray-500">
              Last sync: {lastSyncTime}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {syncProgress && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  syncProgress.status === 'error' 
                    ? 'bg-red-500' 
                    : syncProgress.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {syncProgress.completed} of {syncProgress.total} databases processed
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        {/* Priority Sync Button */}
        <button
          onClick={handleSyncUnifiedBillingOnly}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CloudUpload className="w-5 h-5" />
          )}
          {isLoading ? 'Syncing...' : '🚀 Priority Sync (Unified Billing)'}
        </button>        <div className="flex gap-4">
          <button
            onClick={handleSyncToCloud}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CloudUpload className="w-5 h-5" />
            )}
            {isLoading ? 'Syncing...' : 'Push to Cloud'}
          </button>

          <button
            onClick={handleSyncFromCloud}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CloudDownload className="w-5 h-5" />
            )}
            {isLoading ? 'Syncing...' : 'Pull from Cloud'}
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleBidirectionalSync}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowUpDown className="w-5 h-5" />
            )}
            {isLoading ? 'Syncing...' : '🔄 Bidirectional Sync'}
          </button>

          <button
            onClick={handleCheckSyncStatus}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-5 h-5" />
            Check Status
          </button>
        </div>
      </div>      {/* Information Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Sync Options:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Priority Sync:</strong> Syncs only unified billing data (fastest, most critical)</li>
          <li>• <strong>Push to Cloud:</strong> Upload all local data to cloud (local → cloud)</li>
          <li>• <strong>Pull from Cloud:</strong> Download all cloud data to local (cloud → local)</li>
          <li>• <strong>Bidirectional Sync:</strong> Both push and pull for complete synchronization</li>
        </ul>
        <div className="mt-3 p-3 bg-green-100 rounded border border-green-200">
          <p className="text-sm text-green-800">
            <strong>💡 Tip:</strong> Use <strong>Bidirectional Sync</strong> for the most comprehensive data synchronization.
            Use individual Push/Pull when you need specific data flow direction.
          </p>
        </div>
      </div>

      {/* Warning Section */}
      <div className="mt-4 p-4 bg-amber-50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Note:</strong> Ensure you have a stable internet connection before starting any sync process.
            Large amounts of data may take several minutes to sync. Bidirectional sync takes the longest as it performs both operations.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SyncToCloud
