seajs.config({
	base: "/js",
	alias: {
		//框架代码
		"app": "app",
		"observer": "core/observer",
		"events": "core/events",
		"parser": "core/parser",
		"ajax": "common/ajax",
		"model": "common/model",
		"storage": "common/storage",
		"dir": "page/dir",
		"sideBar": "page/sideBar",
		"view": "page/view",

		//业务代码
		"routes": "mods/routes",
		"pageModels": "mods/common/pageModels",
		"pageStores": "mods/common/pageStores",
		"golbal_objects": "mods/page/golbal_objects",
		"index": "mods/page/index",
		"list": "mods/page/list",
		"search": "mods/page/search",
		"tags": "mods/page/tags"
	}
})