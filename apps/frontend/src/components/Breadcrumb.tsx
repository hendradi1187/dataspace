import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const breadcrumbMap: Record<string, string> = {
  '': 'Home',
  participants: 'Participants',
  datasets: 'Datasets',
  schemas: 'Schemas',
  vocabularies: 'Vocabularies',
  policies: 'Policies',
  contracts: 'Contracts',
  'compliance-records': 'Compliance',
  transactions: 'Transactions',
  'clearing-records': 'Clearing',
  apps: 'Apps',
  connectors: 'Connectors',
};

export const Breadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      const label = breadcrumbMap[segment];
      if (label) {
        breadcrumbs.push({ label, path: currentPath });
      } else {
        // For ID-based routes, use the parent service label + detail
        if (i > 0) {
          const parentSegment = pathSegments[i - 1];
          const parentLabel = breadcrumbMap[parentSegment];
          if (parentLabel) {
            const detailLabel = segment.length > 8 ? `${segment.slice(0, 8)}...` : segment;
            breadcrumbs.push({ label: detailLabel, path: currentPath });
          }
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumb on home page
  if (breadcrumbs.length === 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 mb-6 text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center gap-2">
          {index === 0 ? (
            <Link
              to={item.path}
              className="flex items-center gap-1 px-2 py-1 text-neutral-600 hover:text-primary-600 transition-colors"
              title={item.label}
            >
              <Home size={16} />
            </Link>
          ) : (
            <>
              <ChevronRight size={16} className="text-neutral-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="px-2 py-1 text-neutral-900 font-medium truncate max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="px-2 py-1 text-neutral-600 hover:text-primary-600 transition-colors truncate"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
};
