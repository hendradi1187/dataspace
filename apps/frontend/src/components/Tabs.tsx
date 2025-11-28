import { ReactNode } from 'react';

interface TabProps {
  id: string;
  label: string;
  children: ReactNode;
}

export const Tab = ({ children }: TabProps) => <div>{children}</div>;

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

export const Tabs = ({ activeTab, onTabChange, children }: TabsProps) => {
  const tabs = (Array.isArray(children) ? children : [children]).filter(
    (child) => child?.type?.name === 'Tab'
  );

  const activeTabIndex = tabs.findIndex((tab) => tab.props.id === activeTab);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 mb-6 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.props.id}
            onClick={() => onTabChange(tab.props.id)}
            className={`
              px-4 py-3 text-sm font-medium transition-colors border-b-2
              ${
                activeTab === tab.props.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }
            `}
          >
            {tab.props.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tabs[activeTabIndex]?.props.children}
      </div>
    </div>
  );
};
