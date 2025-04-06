import plugin from "../plugin.json";

acode.setPluginInit(plugin.id, async (baseUrl: string, page: WCPage, { cacheFileUrl, cacheFile }: any) => {
  console.log('Hello, World!');
});

acode.setPluginUnmount(plugin.id, async () => {

});