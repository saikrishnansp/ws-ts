// Navbar.tsx - React component using fetch for API, assuming Vite env and basic CSS/Tailwind setup
import React, { useEffect, useState } from 'react';

interface MenuItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  Slug: string;
  DisplayName: string;
  IsTitle?: boolean;
  DisplayOrder: number;
  ItemName?: string;
  Menu?: string;
  Parameter?: {
    type: string;
    parameter: {
      sort: string;
      filter: string;
    };
  };
  Viewer: string;
  Seo: unknown;
  parent_item?: {
    data: MenuItem | null;
  };
  children?: MenuItem[];
}

const Navbar: React.FC = () => {
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const apiUrl = import.meta.env.VITE_NAV_URI;

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(({ data }: { data: { id: number; attributes: Omit<MenuItem, 'id' | 'children'> }[] }) => {
        const items: MenuItem[] = data.map(item => ({ id: item.id, ...item.attributes, children: [] }));
        const groups: Record<string, MenuItem[]> = {};
        items.forEach(item => {
          const menu = item.Menu || 'Other';
          if (!groups[menu]) groups[menu] = [];
          groups[menu].push(item);
        });

        const syntheticTrees: MenuItem[] = [];
        Object.keys(groups).forEach(menu => {
          const groupItems = groups[menu];
          const idToItem: Record<number, MenuItem> = {};
          groupItems.forEach(item => { idToItem[item.id] = item; });
          const groupRoots: MenuItem[] = [];
          groupItems.forEach(item => {
            const parentId = item.parent_item?.data?.id;
            if (parentId && idToItem[parentId]) {
              idToItem[parentId].children!.push(item);
            } else {
              groupRoots.push(item);
            }
          });
          groupRoots.sort((a, b) => a.DisplayOrder - b.DisplayOrder);

          let displayName = menu;
          if (menu === 'Industry') displayName = 'Industries';
          else if (menu === 'Offering') displayName = 'Offerings';
          else if (menu === 'About Us') displayName = 'About Us';

          const synthetic: MenuItem = {
            id: -Math.random(), // unique negative
            Slug: displayName.toLowerCase().replace(/\s+/g, '-'),
            DisplayName: displayName,
            IsTitle: true,
            DisplayOrder: Math.min(...groupRoots.map(r => r.DisplayOrder)),
            Viewer: '',
            children: groupRoots,
            Seo: null,
          };
          syntheticTrees.push(synthetic);
        });

        syntheticTrees.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        setMenuTree(syntheticTrees);
      });
  }, [apiUrl]);

  const renderMenu = (items: MenuItem[], level: number = 0) => (
    <ul className={`flex ${level > 0 ? 'flex-col' : 'space-x-4'}`}>
      {items
        .sort((a, b) => a.DisplayOrder - b.DisplayOrder)
        .map(item => (
          <li key={item.id} className="relative group">
            {item.id > 0 && item.Viewer && item.Slug ? (
              <a href={`/${item.Viewer}/${item.Slug}`} className="hover:text-blue-300 cursor-pointer">
                {item.DisplayName} {item.children?.length ? '▼' : ''}
              </a>
            ) : (
              <span className="hover:text-blue-300 cursor-pointer">
                {item.DisplayName} {item.children?.length ? '▼' : ''}
              </span>
            )}
            {item.children?.length ? (
              <ul className={`absolute hidden group-hover:block bg-gray-800 p-2 rounded shadow ${level === 0 ? 'top-full left-0' : 'top-0 left-full'}`}>
                {renderMenu(item.children, level + 1)}
              </ul>
            ) : null}
          </li>
        ))}
    </ul>
  );

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">YourLogo</div>
      {renderMenu(menuTree)}
      <button className="bg-blue-600 px-4 py-2 rounded">Action</button>
    </nav>
  );
};

export default Navbar;