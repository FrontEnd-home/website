var Mock = require("mockjs");
var request = require("./request").request;

exports.index = function(req, res){
  // var template = {
  //   "errno": 0,
  //   "msg": "",
  //   "data|10": [{
  //     "id|+1": 1,
  //     "img": "@img(24x24)",
  //     "name|1": ["html", "css", "框架/类库", "开发/调试工具", "性能/测试"],
  //     "enname|1": ["html", "css", "dom", "javascript", "backbone", "node", "sass", "less"],
  //     "parentid": 0,
  //     "rank|1-6": 1,
  //     "quality|1-100": 1,
  //     "add_date": "@date",
  //     "last_modified": "@date",
  //     "sublist|5-10": [{
  //       "id|+1": 7,
  //       "img": "@img(24x24)",
  //       "name|1": ["html", "css", "框架", "类库", "开发", "调试工具", "性能", "测试"],
  //       "enname|1": ["html", "css", "dom", "javascript", "backbone", "node", "sass", "less"],
  //       "parentid|1-6": 1,
  //       "rank|1-6": 1,
  //       "quality|1-100": 1,
  //       "add_date": "@date",
  //       "last_modified": "@date",
  //     }]
  //   }]
  // };

  // var jsonData = Mock.mock(template);

  res.render('index');
};

exports.categoryAll = function(req, res){
  request("/category/readAll", {}, function(err, data){
      if(err){
        res.render('404', {errmsg: err.message});
      } else{
        var json = JSON.parse(data);
        var categoryData = json.body.category;
        var category = [];
        categoryData.forEach(function(item){
          var newItem = {
            "slug": item.slug,
            "name": item.name,
            "id" : item._id
          };
          if(!item._parent_id){
            category.push(newItem);
            //newItem["parent_id"] = item._parent_id;
          }
        });
        category.forEach(function(item){
            categoryData.forEach(function(subItem){
                if(item.id == subItem._parent_id){
                    var newItem = {
                      "slug": subItem.slug,
                      "name": subItem.name,
                      "id" : subItem._id,
                      "parent_id": subItem._parent_id
                    };
                    item.sublist = item.sublist || [];
                    item.sublist.push(newItem);
                }
            });
        });
        res.setHeader("Content-Type", "text/javascript");
        res.send("var sideBarData = " + JSON.stringify(category, null, 4) + ";");
      }
  });
}