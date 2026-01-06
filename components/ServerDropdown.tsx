'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, UserPlus, Settings, Users, PlusCircle, Trash2 } from 'lucide-react';

interface ServerDropdownProps {
  serverName: string;
}

const ServerDropdown: React.FC<ServerDropdownProps> = ({ serverName }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Invite People', icon: <UserPlus className="h-4 w-4 mr-2" />, onClick: () => alert('Invite People') },
    { label: 'Server Settings', icon: <Settings className="h-4 w-4 mr-2" />, onClick: () => alert('Server Settings') },
    { label: 'Manage Members', icon: <Users className="h-4 w-4 mr-2" />, onClick: () => alert('Manage Members') },
    { label: 'Create Channel', icon: <PlusCircle className="h-4 w-4 mr-2" />, onClick: () => alert('Create Channel') },
    { label: 'Delete Server', icon: <Trash2 className="h-4 w-4 mr-2" />, onClick: () => alert('Delete Server'), danger: true },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center px-4 py-2"
        onClick={() => setOpen(prev => !prev)}
      >
        {serverName}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-background border rounded-md shadow-lg z-50">
          <ul className="flex flex-col text-sm">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-4 py-2 flex items-center hover:bg-muted ${
                    item.danger ? 'hover:bg-red-600 hover:text-white' : ''
                  }`}
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ServerDropdown;
