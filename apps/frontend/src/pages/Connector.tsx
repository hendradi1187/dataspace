import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Badge, StatusBadge } from '@components/Badge';
import { Button } from '@components/Button';
import { Tabs, Tab } from '@components/Tabs';
import { Modal } from '@components/Modal';
import { Settings, Plus, RefreshCw, Upload } from 'lucide-react';
import { useDataStore } from '@stores/data-store';
import { useNotificationStore } from '@stores/notification-store';
import type { ConnectorMetadata, ConnectorApp } from '@types';

export const Connector = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'policies'>('overview');
  const [showModal, setShowModal] = useState(false);
  const [connectorStatus, setConnectorStatus] = useState<ConnectorMetadata | null>(null);
  const [installedApps, setInstalledApps] = useState<ConnectorApp[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadConnectorStatus();
  }, []);

  const loadConnectorStatus = async () => {
    setIsLoading(true);
    try {
      // Mock connector status
      const mockStatus: ConnectorMetadata = {
        id: 'connector-1',
        name: 'Local Connector',
        description: 'Local data connector instance',
        status: 'online',
        version: '1.0.0',
        endpoint: 'http://localhost:3009',
        lastHeartbeat: new Date().toISOString(),
      };

      const mockApps: ConnectorApp[] = [
        {
          id: 'app-1',
          name: 'Data Validator',
          version: '1.2.0',
          status: 'installed',
          installDate: new Date().toISOString(),
          description: 'Validates data schemas before transfer',
        },
        {
          id: 'app-2',
          name: 'Encryption Service',
          version: '2.0.1',
          status: 'installed',
          installDate: new Date().toISOString(),
          description: 'Provides end-to-end encryption',
        },
        {
          id: 'app-3',
          name: 'Analytics Plugin',
          version: '1.5.0',
          status: 'available',
          description: 'Real-time analytics on transferred data',
        },
      ];

      setConnectorStatus(mockStatus);
      setInstalledApps(mockApps);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load connector status',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallApp = (appId: string) => {
    setInstalledApps(
      installedApps.map((app) =>
        app.id === appId ? { ...app, status: 'installed' } : app
      )
    );
    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Application installed successfully',
    });
  };

  if (!connectorStatus) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Connector Management</h1>
          <p className="text-neutral-600 mt-2">Manage your data connector instance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadConnectorStatus}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button icon={<Settings size={16} />}>Configure</Button>
        </div>
      </div>

      {/* Connector Overview */}
      <Card>
        <CardHeader
          title="Connector Status"
          action={<StatusBadge status={connectorStatus.status} />}
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-4">Properties</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-600">Name</p>
                  <p className="font-medium text-neutral-900">{connectorStatus.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Version</p>
                  <p className="font-medium text-neutral-900">{connectorStatus.version}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Endpoint</p>
                  <p className="font-mono text-sm text-neutral-600">{connectorStatus.endpoint}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-4">Health</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-600">Last Heartbeat</p>
                  <p className="font-medium text-neutral-900">
                    {new Date(connectorStatus.lastHeartbeat).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Status</p>
                  <StatusBadge status={connectorStatus.status} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          <Tab id="overview" label="Overview">
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Subcomponents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Metadata', status: 'online' },
                  { name: 'Policy-Contract', status: 'online' },
                  { name: 'Auth-Protocol', status: 'online' },
                  { name: 'App-Management', status: 'online' },
                  { name: 'Delivery', status: 'online' },
                ].map((component) => (
                  <div
                    key={component.name}
                    className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                  >
                    <span className="font-medium text-neutral-900">{component.name}</span>
                    <StatusBadge status={component.status} />
                  </div>
                ))}
              </div>
            </div>
          </Tab>

          <Tab id="apps" label="Applications">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Installed Applications</h3>
                <Button icon={<Plus size={16} />} size="sm">
                  Browse Apps
                </Button>
              </div>

              <div className="space-y-3">
                {installedApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{app.name}</h4>
                      <p className="text-sm text-neutral-600">{app.description}</p>
                      <p className="text-xs text-neutral-500 mt-1">v{app.version}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.status} />
                      {app.status === 'available' && (
                        <Button
                          size="sm"
                          onClick={() => handleInstallApp(app.id)}
                          icon={<Upload size={14} />}
                        >
                          Install
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tab>

          <Tab id="policies" label="Policies">
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Active Policies</h3>
              <p className="text-sm text-neutral-600">
                Policies define how data can be accessed and used on this connector
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Data Minimization', status: 'active' },
                  { name: 'Encryption Required', status: 'active' },
                  { name: 'Rate Limiting', status: 'inactive' },
                  { name: 'Geographic Restriction', status: 'active' },
                ].map((policy) => (
                  <div
                    key={policy.name}
                    className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between"
                  >
                    <span className="font-medium text-neutral-900">{policy.name}</span>
                    <StatusBadge status={policy.status} />
                  </div>
                ))}
              </div>
            </div>
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
};
