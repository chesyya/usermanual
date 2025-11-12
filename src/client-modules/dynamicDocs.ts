import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  console.log('[DynamicDocs] Client module loaded');
}

export function onRouteUpdate({location}: {location: Location}) {
  console.log('[DynamicDocs] Route updated:', location.pathname);
}
