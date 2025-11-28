import { useState } from 'react';
import { Filter, Download, Eye } from 'lucide-react';
import { useAuditLogStore, AuditAction } from '@stores/audit-log-store';
import { DataTable } from '@components/DataTable';
import { AdvancedFilters, FilterField } from '@components/AdvancedFilters';

const FILTER_FIELDS: FilterField[] = [
  {
    key: 'action',
    label: 'Action',
    type: 'select',
    options: [
      { value: 'CREATE', label: 'Create' },
      { value: 'READ', label: 'Read' },
      { value: 'UPDATE', label: 'Update' },
      { value: 'DELETE', label: 'Delete' },
      { value: 'EXPORT', label: 'Export' },
      { value: 'IMPORT', label: 'Import' },
      { value: 'LOGIN', label: 'Login' },
      { value: 'LOGOUT', label: 'Logout' },
      { value: 'PERMISSION_CHANGE', label: 'Permission Change' },
      { value: 'ROLE_CHANGE', label: 'Role Change' },
      { value: 'POLICY_CHANGE', label: 'Policy Change' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'success', label: 'Success' },
      { value: 'failure', label: 'Failure' },
    ],
  },
];

export const AuditLogs = () => {
  const { getFilteredLogs, setFilters, clearFilters, getLogs, getActionStats, getUserStats, getFailureRate } = useAuditLogStore();

  const [filterState, setFilterState] = useState<Record<string, any>>({});
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);

  const allLogs = getLogs();
  const logs = filterState && Object.keys(filterState).length > 0 ? getFilteredLogs() : allLogs;
  const actionStats = getActionStats();
  const userStats = getUserStats();
  const failureRate = getFailureRate();

  const handleApplyFilters = (newFilters: Record<string, any>) => {
    setFilterState(newFilters);
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilterState({});
    clearFilters();
  };

  const getActionColor = (action: AuditAction) => {
    const colors: Record<AuditAction, string> = {
      CREATE: 'bg-blue-100 text-blue-900 border-blue-300',
      READ: 'bg-green-100 text-green-900 border-green-300',
      UPDATE: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      DELETE: 'bg-red-100 text-red-900 border-red-300',
      EXPORT: 'bg-purple-100 text-purple-900 border-purple-300',
      IMPORT: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      LOGIN: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      LOGOUT: 'bg-gray-100 text-gray-900 border-gray-300',
      PERMISSION_CHANGE: 'bg-orange-100 text-orange-900 border-orange-300',
      ROLE_CHANGE: 'bg-pink-100 text-pink-900 border-pink-300',
      POLICY_CHANGE: 'bg-teal-100 text-teal-900 border-teal-300',
      SEARCH: 'bg-lime-100 text-lime-900 border-lime-300',
    };
    return colors[action] || 'bg-neutral-100 text-neutral-900 border-neutral-300';
  };

  const getStatusColor = (status: string) => {
    return status === 'success'
      ? 'bg-green-100 text-green-900 border-green-300'
      : 'bg-red-100 text-red-900 border-red-300';
  };

  const getActionIcon = (action: AuditAction) => {
    const icons: Record<AuditAction, string> = {
      CREATE: '➕',
      READ: '👁️',
      UPDATE: '✏️',
      DELETE: '🗑️',
      EXPORT: '📤',
      IMPORT: '📥',
      LOGIN: '🔓',
      LOGOUT: '🔒',
      PERMISSION_CHANGE: '🔐',
      ROLE_CHANGE: '👤',
      POLICY_CHANGE: '⚙️',
      SEARCH: '🔍',
    };
    return icons[action] || '•';
  };

  const topUsers = Object.entries(userStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Audit Logs</h1>
        <p className="text-neutral-600 mt-2">Track user activities and system events</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Events</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{allLogs.length}</p>
        </div>
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Successful</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {allLogs.filter((l) => l.status === 'success').length}
          </p>
        </div>
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Failed Events</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {allLogs.filter((l) => l.status === 'failure').length}
          </p>
        </div>
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">Failure Rate</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">{failureRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex gap-4 items-start flex-wrap">
        <AdvancedFilters
          fields={FILTER_FIELDS}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Active Filters Display */}
      {Object.keys(filterState).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filterState).map(([key, value]) => (
            <div key={key} className="px-3 py-1 bg-primary-100 text-primary-900 rounded-full text-sm flex items-center gap-2">
              <span>
                {key}: {value}
              </span>
              <button
                onClick={() => {
                  const newFilters = { ...filterState };
                  delete newFilters[key];
                  handleApplyFilters(newFilters);
                }}
                className="hover:text-primary-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{log.userName}</p>
                      <p className="text-xs text-neutral-500">{log.userId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)} {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{log.resourceType}</p>
                      {log.resourceName && <p className="text-xs text-neutral-500">{log.resourceName}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.details && (
                      <button
                        onClick={() => setDetailsOpen(detailsOpen === log.id ? null : log.id)}
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={16} className="text-neutral-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Details Row */}
        {detailsOpen && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
            {logs.find((l) => l.id === detailsOpen)?.details && (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Details</p>
                <p className="text-sm text-neutral-600">
                  {logs.find((l) => l.id === detailsOpen)?.details}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {topUsers.map(([userName, count], idx) => (
              <div key={userName} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-medium text-neutral-700">{userName}</p>
                </div>
                <p className="text-sm font-semibold text-neutral-900">{count} events</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Distribution */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Action Distribution</h3>
          <div className="space-y-3">
            {Object.entries(actionStats)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getActionIcon(action as AuditAction)}</span>
                    <p className="text-sm font-medium text-neutral-700">{action}</p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">{count}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
