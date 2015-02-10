website
=======

网站项目代码

#### 仓库目录结构：
```js
devguide
|- public        //项目发布静态资源
|   |- fonts
|   |- icons
|   |- js
|   |- images
|
|- src           //项目开发资源
|   |- img
|   |- sass
|   |- js
|   |   |-vendor //外部依赖
|
|- views/        //layout模板
|- lib/       |--//服务类脚本
|- server.js  |
|- test/         //测试
|- gulp          //批处理task
|- _site         //生成UED稿
|- vendor        //外部工具
|- README.md
```


####脚本运行
源代码处于src/js内部，直接输出到public/js中，修改好js执行 `gulp jsdev` 命令
