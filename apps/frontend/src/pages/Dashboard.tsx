import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@components/Card';
import { Badge, StatusBadge } from '@components/Badge';
import {
  BarChart3,
  Users,
  Database,
  Shield,
  FileText,
  Activity,
} from 'lucide-react';
import { useDataStore } from '@stores/data-store';
import type { HealthResponse } from '@types';
import {
  idpClient,
  brokerClient,
  policyClient,
} from '@utils/api-client';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline';
  port: number;
  icon: React.ReactNode;
}

export const Dashboard = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { participants, datasets, policies, contracts } = useDataStore();

  const allServices = [
    { name: 'IDP', port: 3000, client: idpClient, icon: <Shield size={24} /> },
    { name: 'Broker', port: 3001, client: brokerClient, icon: <Database size={24} /> },
    { name: 'Hub', port: 3002, client: brokerClient, icon: <Database size={24} /> },
    { name: 'Policy', port: 3003, client: policyClient, icon: <Shield size={24} /> },
    { name: 'Contract', port: 3004, client: brokerClient, icon: <FileText size={24} /> },
    // { name: 'Connector', port: 3009, client: connectorClient, icon: <Activity size={24} /> }, // TODO: Enable when implemented
  ];

  useEffect(() => {
    const checkServices = async () => {
      setIsLoading(true);
      const serviceStatuses: ServiceStatus[] = [];

      for (const service of allServices) {
        try {
          await service.client.get('/health');
          serviceStatuses.push({
            name: service.name,
            status: 'online',
            port: service.port,
            icon: service.icon,
          });
        } catch {
          serviceStatuses.push({
            name: service.name,
            status: 'offline',
            port: service.port,
            icon: service.icon,
          });
        }
      }

      setServices(serviceStatuses);
      setIsLoading(false);
    };

    checkServices();
    const interval = setInterval(checkServices, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Participants', value: participants.length, icon: Users },
    { label: 'Datasets', value: datasets.length, icon: Database },
    { label: 'Policies', value: policies.length, icon: Shield },
    { label: 'Contracts', value: contracts.length, icon: FileText },
  ];

  const onlineServices = services.filter((s) => s.status === 'online').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-2">
          Welcome to Dataspace Platform. Monitor and manage your infrastructure.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} elevation="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Icon size={24} className="text-primary-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader
          title="Service Status"
          subtitle={`${onlineServices} of ${services.length} services online`}
          action={
            <Badge variant="success" size="sm">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p className="text-neutral-600">Checking services...</p>
            ) : (
              services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center gap-3 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="text-neutral-600">{service.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{service.name}</p>
                    <p className="text-xs text-neutral-500">Port {service.port}</p>
                  </div>
                  <StatusBadge status={service.status} />
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Architecture Overview */}
      <Card>
        <CardHeader
          title="Architecture Overview"
          subtitle="Distributed Dataspace Services"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <BarChart3 size={20} className="text-primary-600" />
                Core Trust Services (CTS)
              </h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>• Identity Provider (IDP)</li>
                <li>• Broker Discovery</li>
                <li>• Schema Hub</li>
                <li>• Policy Authority</li>
                <li>• Contract Authority</li>
                <li>• Compliance & Obligations</li>
                <li>• Ledger & Settlement</li>
                <li>• Clearing & Metering</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Activity size={20} className="text-secondary-600" />
                Edge Nodes (Connectors)
              </h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>• Metadata Management</li>
                <li>• Policy & Contract</li>
                <li>• Authentication Protocol</li>
                <li>• Application Management</li>
                <li>• Data Delivery</li>
                <li>• Provenance Tracking</li>
                <li>• Token Cache</li>
                <li>• Event Management</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
