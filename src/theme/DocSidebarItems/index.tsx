import React, { useEffect, useState, useRef, useMemo, JSX } from 'react';
import DocSidebarItems from '@theme-original/DocSidebarItems';
import type { Props } from '@theme/DocSidebarItems';
// 辅助类型：从 Props 中提取侧边栏项目的实际类型
type PropSidebarItem = Props['items'][number];


const API_URL = 'http://localhost:3001/api/docs/structure';

interface PluginItem {
  type: 'doc' | 'category';
  id?: string;
  label: string;
  path: string;
  items?: PluginItem[];
}

// 定义插件目录项的结构类型 (它必须兼容 PropSidebarItem)
type PluginCategory = {
  type: 'category';
  label: string;
  collapsible: boolean;
  collapsed: boolean;
  items: Array<PropSidebarItem>; // 确保 items 内部也是 PropSidebarItem 类型
}

// 修复点 1: 明确 Map 键的类型为只读 PropSidebarItem[]
const cachedMergedItems = new Map<readonly PropSidebarItem[], PropSidebarItem[]>();

// useRef 来确保异步请求只发送一次
const fetchPromiseRef = {
  promise: null as Promise<PluginItem[]> | null,
  isFetched: false,
};


// 递归转换数据结构
function convertItems(items: PluginItem[]): PropSidebarItem[] {
  return items.map(item => {
    if (item.type === 'category') {
      return {
        type: 'category',
        label: item.label,
        collapsible: true,
        collapsed: false,
        items: convertItems(item.items || []),
      } as PropSidebarItem;
    } else {
      const href = `/dynamic-docs/${item.id}`;
      console.log('[DocSidebarItems] Creating link:', item.label, '-> href:', href);
      return {
        type: 'link',
        label: item.label,
        href: href,
      } as PropSidebarItem;
    }
  });
}

// 异步获取数据并构建插件目录项
function getPluginCategory(data: PluginItem[]): PluginCategory {
  return {
    type: 'category',
    label: '插件',
    collapsible: true,
    collapsed: false,
    items: convertItems(data),
  } as PluginCategory;
}

// ----------------------------------------------------
// 主组件
// ----------------------------------------------------

export default function DocSidebarItemsWrapper(props: Props): JSX.Element {
  // 1. 使用 state 存储插件数据（或 null/undefined/[] 表示加载中/失败）
  const [pluginItems, setPluginItems] = useState<PluginItem[] | null>(null);

  // 2. 仅在组件挂载时运行，执行数据获取
  useEffect(() => {
    if (fetchPromiseRef.isFetched) return;

    fetchPromiseRef.isFetched = true;
    const fetchOperation = fetch(API_URL)
      .then(res => res.json())
      .then((response: {success: boolean, data: PluginItem[]}) => {
        if (response.success && Array.isArray(response.data)) {
          setPluginItems(response.data);
          return response.data;
        }
        return [];
      })
      .catch(err => {
        console.error('Failed to fetch plugin menu:', err);
        setPluginItems([]);
        return [];
      });

    fetchPromiseRef.promise = fetchOperation;

  }, []); // 严格只执行一次

  // 3. 使用 useMemo 来计算最终的侧边栏 items，并缓存结果
  const finalItems = useMemo(() => {
    // 修复点 2: Map 键类型现在匹配，错误消失
    if (cachedMergedItems.has(props.items)) {
      return cachedMergedItems.get(props.items)!;
    }

    // 如果插件数据尚未加载或为空，我们直接返回原始 items
    if (!pluginItems || pluginItems.length === 0) {
      return props.items;
    }

    // 构建新的插件目录项
    const pluginCategory = getPluginCategory(pluginItems);

    // 合并并缓存最终结果
    // merged 数组的类型是 (PropSidebarItem | PluginCategory)[]，兼容 PropSidebarItem[]
    const merged = [...props.items, pluginCategory] as PropSidebarItem[];

    // 修复点 3: Map 值类型现在匹配，错误消失
    cachedMergedItems.set(props.items, merged);

    return merged;

  }, [props.items, pluginItems]);

  // 4. 渲染时使用 useMemo 缓存的最终结果
  return <DocSidebarItems {...props} items={finalItems} />;
}
