import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { executeCommand } from '@/commands/registry';
import { useSettings } from '@/hooks/useSettings';

/**
 * NOVA Popup — the toolbar icon popup.
 * Quick access to commands and status.
 */

const QuickAction: React.FC<{
  name: string;
  icon: string;
  onClick: () => void;
}> = ({ name, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="nova-list-item w-full text-left"
  >
    <Icon name={icon as any} size={14} />
    <span className="text-sm">{name}</span>
  </button>
);

const PopupApp: React.FC = () => {
  const { settings } = useSettings();
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      setActiveCount(tabs.length);
    });
  }, []);

  const handleCommand = async (cmdId: string) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      await executeCommand(cmdId, {
        tabId: tabs[0]?.id,
        windowId: tabs[0]?.windowId,
        url: tabs[0]?.url,
      });
    } catch (err) {
      console.error('NOVA: Command error', err);
    }
  };

  return (
    <div className="p-3 min-w-[280px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[hsl(var(--border))]">
        <Icon name="sparkles" size={20} />
        <span className="font-medium">NOVA</span>
        <span className="ml-auto text-xs text-[hsl(var(--text-tertiary))]">
          {activeCount} tab{activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Quick actions */}
      <div className="space-y-0.5">
        <QuickAction
          name="Command Palette"
          icon="search"
          onClick={() => handleCommand('command-palette')}
        />
        <QuickAction
          name="Save Current Page"
          icon="bookmark-slash"
          onClick={() => handleCommand('save.page')}
        />
        <QuickAction
          name="New Tab"
          icon="plus"
          onClick={() => handleCommand('tab.new')}
        />
        <QuickAction
          name="Toggle Side Panel"
          icon="bars-3"
          onClick={() => handleCommand('tools.sidepanel')}
        />
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => chrome.runtime.openOptionsPage()}
            className="nova-btn nova-btn-ghost nova-btn-sm"
          >
            <Icon name="cog" size={14} />
            <span>Settings</span>
          </button>
          <button
            type="button"
            onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('newtab/index.html') })}
            className="nova-btn nova-btn-ghost nova-btn-sm"
          >
            <Icon name="window" size={14} />
            <span>New Tab</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupApp;
