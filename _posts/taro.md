---
title: 'taro 微信小程序的架子'
description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
date: '2022-02-21'
modified_date: '2022-02-21'
image: /assets/images/posts/random-img.jpg
---

# 前言

公司需要一个 taro 微信小程序的架子，人手不够由本菜鸡进行构建，新手一枚，欢迎大佬们提意见

# 介绍

该项目基于 taro3.x 进行构建，搭载 ts，dva，scss，使用 react hooks 写法

# 开始

### Taro 项目基于 node，请确保已具备较新的 node 环境(>=12.0.0)

## 安装

全局安装@tarojs/cli

```js
npm install -g @tarojs/cli
or
yarn global add @tarojs/cli
```

项目初始化

```js
taro init myProject
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d9d00296edc4b26b02e8e23b6f04e08~tplv-k3u1fbpfcp-watermark.image?)

模板源使用 Gitee 或者 Github 都可

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a260411840c14474892b5a39d49b7a1c~tplv-k3u1fbpfcp-watermark.image?)

这里对 hooks 没那么熟悉的同学建议选择 taro-hooks 模板,便于看看结构，也许给你点启发

安装完成后可以通过命令去看效果了

```js
npm run dev:weapp // 编译
npm run build:weapp // 打包
```

基本的结构出来了，但是对于整个项目来说，我们还可以为它做些事情

# dva

dva 首先是一个基于 redux 和 redux-saga 的数据流方案，然后为了简化开发体验，dva 还额外内置了 react-router 和 fetch，所以也可以理解为一个轻量级的应用框架。(这是[官网](https://dvajs.com/)的介绍)

## 项目使用 dva

完成以上步骤后我们需要在项目中安装依赖

```js
npm i --save dva-core dva-loading redux react-thunk redux-logger
```

手动在 src/utils/新建文件 dva.ts

```js
// src/utils/dva.ts
import { create } from "dva-core";
// import {createLogger } from 'redux-logger';
import createLoading from "dva-loading";

let app: {
  use: (arg0: any) => void,
  model: (arg0: any) => any,
  start: () => void,
  _store: any,
  getStore: () => any,
  dispatch: any,
};
let store: { dispatch: any };
let dispatch: any;
let registered: boolean;

function createApp(opt: { models: any[], initialState: any }) {
  // redux日志, 引用redux-logger
  // opt.onAction = [createLogger()];
  app = create(opt);
  app.use(createLoading({}));

  if (!registered) opt.models.forEach((model: any) => app.model(model));
  registered = true;
  app.start();

  store = app._store;
  app.getStore = () => store;

  dispatch = store.dispatch;

  app.dispatch = dispatch;
  return app;
}

export default {
  createApp,
  getDispatch() {
    return app.dispatch;
  },
  getStore() {
    // 这个是在非组件的文件中获取Store的方法, 不需要可以不暴露
    return app.getStore();
  },
};
```

创建 models 文件夹,models 文件夹下的结构

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f35a8d3f44874b1a961495d496ded5bb~tplv-k3u1fbpfcp-watermark.image?)

models/index.ts

```js
import global from "@/pages/models/global";

export default [global]; // 这里是数组, 数组中的每个项都是独立的模块
```

models/global.ts

```js
import Taro from "@tarojs/taro";
import api from "@/services/index"; // 这个是我的封装，待会会有讲

const { login } = api;
export default {
  namespace: "global",
  state: {
    // 用户信息
    userInfo: {},
  },

  effects: {
    *getUserInfo(_, { call }) {
      const userInfo = yield call(Taro.login, { lang: "zh_CH" });
      const c = yield call(login, "GET", { bb: 1 });
      console.log(userInfo, c);
    },

    reducers: {
      setState(state, { payload }) {
        return {
          ...state,
          ...payload,
        };
      },
    },
  },
};
```

最后，我们要在 app.ts 处理一下

```js
import Taro from "@tarojs/taro";
import React, { Component } from "react";
/* dva */
import { Provider } from "react-redux";
import dva from "./utils/dva";
import models from "./models/index";

// 全局样式
// import './styles/base.scss'

const dvaApp = dva.createApp({
  initialState: {},
  models: models,
});
const store = dvaApp.getStore();

class App extends Component {
  componentDidMount() {
    if (process.env.TARO_ENV === "weapp") {
      // 云开发初始化
      // Taro.cloud.init({env:'',traceUser: true,})
    }
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
export default App;
```

# 封装

手动创建 request.ts,写一个比较简单的请求

```js
import Taro from "@tarojs/taro";
import { apiPrefix } from "./config";

const HTTP_SUCCESS_CODE = [200, 0];
const HTTP_ERR_CODE = {
  400: "错误请求",
  401: "请求未经授权，请重新登录",
  403: "服务器拒绝访问",
  404: "请求失败，未找到指定资源",
  405: "请求的方法已被禁用",
  406: "服务器不接受该请求",
  407: "请求需要代理授权",
  408: "请求超时",
  409: "服务器在完成请求时发生冲突",
  410: "服务器已永久删除请求的资源",
  411: "服务器不接受不含有效内容长度标头字段的请求",
  412: "服务器未满足前提条件",
  413: "请求实体过大",
  414: "请求的 URI 过长",
  415: "不支持的媒体类型",
  416: "请求范围不符合要求",
  417: "请求的标头字段不满足服务器要求",
  500: "服务器内部出错",
  501: "服务器无法识别请求方法",
  502: "网关错误",
  503: "服务器目前无法使用",
  504: "网络超时，请在有网的环境下重试",
  505: "HTTP版本不支持该请求",
};

interface requestProps {
  url: string;
  data?: object;
  method?: any;
  loadingCopy: string;
}
/**
 * 网络请求
 * @param {*} url 路径
 * @param {*} method 请求类型
 * @param {*} data 请求参数
 * @param {*} loadingCopy loading 文字
 * @returns
 */
const Request = ({
  url,
  method,
  data = {},
  loadingCopy = "加载中",
}: requestProps) => {
  loadingCopy && Taro.showLoading({ title: loadingCopy });
  return new Promise((resolve, reject) => {
    const cloneData = JSON.parse(JSON.stringify(data));
    Taro.request({
      url: `${apiPrefix}${url}`,
      method,
      data: cloneData,
      header: {
        "Content-Type": "application/json",
      },
      complete: () => {
        loadingCopy && Taro.hideLoading();
      },
    }).then(
      (res) => {
        if (res.statusCode !== 200) return;
        resolve(res?.data ?? res);
      },
      (err) => {
        const error = JSON.parse(JSON.stringify(err));
        const { statusCode } = error;
        Taro.showToast({ title: HTTP_ERR_CODE[statusCode] || "服务器错误" });
        console.error("---抛出异常---", error);
        reject(error);
      }
    );
  });
};

export const checkResponse = (res, msgKey: string = "msg") => {
  const { status, code } = res || {};
  const ret =
    HTTP_SUCCESS_CODE.includes(status) || HTTP_SUCCESS_CODE.includes(code);
  if (!ret) {
    Taro.showToast({ title: res[msgKey] || "服务器错误" });
    return false;
  }
  return ret;
};

export default Request;
```

创建一个 api.ts，目的是统一管理所有的 api

```js
export default {
  login: "login/user", //登录
};
```

最后创建一个 index.ts，用于统一处理 api 和 request 方法，使他们成为一个对象，例如：

{
login:request("login/user")
}

```js
import apiRequest from "@/utils/request";
import api from "./api";

const handleApiFun = (url: string) => {
  return function (method = "GET", data: object, loadingCopy = "加载中") {
    return apiRequest({
      url,
      method,
      data,
      loadingCopy,
    });
  };
};

const ApiFun: any = {};
for (const key in api) {
  ApiFun[key] = handleApiFun(api[key]);
}
export default ApiFun;
```

### 封装好后，结合 dva 去组件中使用，调接口试试

models 层写好方法

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1417ac528a0149d2b981d20487b92616~tplv-k3u1fbpfcp-watermark.image?)

我们在 hooks 模板中随便用用

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/946de65408b74bb8989b97795926bb0d~tplv-k3u1fbpfcp-watermark.image?)

dva 的简单使用就是这样啦，需要深究用法可以去官网或拜读别的大佬文章学习学习

# eslint stylelint commit

开发项目规范非常重要，为了提高工作效率，便于后人添加功能及前端后期优化维护，当然目标就是无论有多少人共同参与同一项目，一定要确保每一行代码都像是唯一个人编写的。

## eslint

老规矩装依赖

```js
npm i @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-taro eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks -D
```

这里还应该安装一个 eslint，在搭建的时候发现了一个小问题，安装最新的版本时，eslint 跑起来总是遇到版本错误，最后回退了版本，"eslint": "^6.8.0"，才恢复正常，同学们可以探讨一下，如还是不行可以尝试 6.8 版本

项目根目录创建 eslintrc.js 和 eslintignore，前者是 eslint 的基础配置，后者是配置 eslint 忽略不校验某文件
eslint 配置，直接上码

```js
module.exports = {
  extends: ["taro/react"],
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint/eslint-plugin",
    "prettier",
  ],
  rules: {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "no-unexpected-multiline": "error", //禁止多行三元
    "no-var": "error", // 禁止使用var
    "prefer-const": "error", // 建议使用const
    "no-const-assign": "error", // 禁止修改使用const（no-const-assign）声明的变量
    "object-shorthand": "error", // 方法属性值简写
    "quote-props": ["error", "as-needed"], // 只对那些无效的标示使用引号 ''
    "no-array-constructor": "error", // 数组要求字面量赋值
    "no-new-object": "error", // 对象使用字面值创建对象
    "array-callback-return": "error", // 在数组方法的回调中强制执行
    "prefer-template": "error", // 建议使用模板字符串
    "no-eval": "error", // 禁止使用eval
    "no-useless-escape": "error", // 不要使用不必要的转义字符
    "func-style": "error", // 用命名函数表达式而不是函数声明
    "prefer-rest-params": "error", // 建议使用rest参数而不是参数
    "space-before-function-paren": ["error", "never"], // 函数前不允许使用空格或
    "space-before-blocks": ["error", "always"], // 块前需要空格
    "no-param-reassign": "error", // 不允许重新分配函数参数
    "prefer-arrow-callback": "error", // 建议使用箭头函数
    "arrow-spacing": "error", // 箭头函数的箭头前后需要空格
    "arrow-body-style": ["error", "always"], // 在箭头函数体中需要大括号
    "no-confusing-arrow": ["error", { allowParens: true }], // 不允许箭头函数与比较混淆
    "no-useless-constructor": "error", // 不允许不必要的构造函数
    "no-dupe-class-members": "error", // 不允许在类成员中使用重复名称
    "no-duplicate-imports": ["error", { includeExports: true }], // 不允许重复导入
    "import/first": "error", // import 放在其他所有语句之前
    "dot-notation": "error", // 访问属性时使用点符号
    "no-restricted-properties": "error", // 做幂运算时用幂操作符 **
    "one-var": ["off", "always"], // 强制在函数中单独声明变量
    "no-multi-assign": "error", // 不要使用连续变量分配
    "no-plusplus": "error", // 不要使用一元递增递减运算符（++， --）
    "no-unused-vars": "off", // 不允许有未使用的变量
    "no-case-declarations": "error", // 不允许在case/default子句中使用词法声明
    "no-nested-ternary": "error", // 三元表达式不应该嵌套，通常是单行表达式
    "no-unneeded-ternary": "error", // 避免不需要的三元表达式
    "no-mixed-operators": "off", // 不允许不同运算符的混合
    "nonblock-statement-body-position": ["error", "beside"], // 强制单行语句的位置
    "brace-style": "error", // 需要大括号样式
    "no-else-return": "error", // 如果if语句都要用return返回，那后面的else就不用写了。如果if块中包含return，它后面的else if块中也包含了return，这个时候就可以把else if拆开
    "keyword-spacing": ["error", { before: true }], // 在关键字前后强制使用一致的间距
    "space-infix-ops": ["error", { int32Hint: false }], // 用空格来隔开运算符
    "padded-blocks": ["error", "never"], // 不要故意留一些没必要的空白行
    "array-bracket-spacing": ["error", "never"], // 方括号里不要加空格
    "object-curly-spacing": ["error", "always"], // 花括号 {} 里加空格
    "comma-spacing": ["error", { before: false, after: true }], //  , 前避免空格， , 后需要空格
    "key-spacing": ["error", { beforeColon: false }], // 在对象的属性中， 键值之间要有空格
    "no-trailing-spaces": "error", // 行末不要空格
    "no-multiple-empty-lines": "error", // 避免出现多个空行。 在文件末尾只允许空一行
    "no-new-wrappers": "error", // 不允许基元包装实例
    "new-cap": "off", // 要求构造函数名称以大写字母开头
    "default-case": "error", //要求 switch 语句中有 default 分支
    "jsx-quotes": ["error", "prefer-double"], //强制所有不包含单引号的 JSX 属性值使用单引号
    quotes: ["error", "single"], // string 统一用单引号 ''
    eqeqeq: ["error", "always"], // 使用 === 和 !== 而不是 == 和 !=
    radix: ["error", "as-needed"], // 需要基数参数
    camelcase: ["error", { properties: "always" }], // 要求驼峰式命名对象、函数、实例
    "prefer-destructuring": [
      "error",
      {
        array: true,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ], // 用对象的解构赋值来获取和使用对象某个或多个属性值
    "spaced-comment": [
      "error",
      "always",
      {
        line: {
          markers: ["/"],
          exceptions: ["-", "+"],
        },
        block: {
          markers: ["!"],
          exceptions: ["*"],
          balanced: true,
        },
      },
    ], // 强制在注释中 // 或 /* 使用一致的空格
    //  "indent": ["error", 2, { "SwitchCase": 1}], // 强制2个空格
    // 'no-underscore-dangle': 'error', // 不要用前置或后置下划线
  },
};
```

## stylelint

StyleLint 是『一个强大的、现代化的 CSS 检测工具』, 与 ESLint 类似, 是通过定义一系列的编码风格规则帮助我们避免在样式表中出现错误.

en....装依赖吧

```js
npm i stylelint stylelint-config-recess-order stylelint-config-standard stylelint-order -D
```

项目根目录创建 stylelintrc.js 和 stylelintignore，前者是 stylelint 的基础配置，后者是配置 stylelint 忽略不校验某文件

```js
module.exports = {
  processors: [],
  plugins: [],
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"], // 这是官方推荐的方式
  rules: {
    "unit-no-unknown": [true, { ignoreUnits: ["rpx"] }],
    "no-descending-specificity": null,
    "no-duplicate-selectors": null,
  },
};
```

## commit

在代码提交之前，进行代码规则检查能够确保进入 git 库的代码都是符合代码规则的。但是整个项目上运行 lint 速度会很慢，lint-staged 能够让 lint 只检测暂存区的文件，所以速度很快。

```js
npm i husky lint-staged -D
```

在 package.json 中配置

```js
"lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.scss": [
      "stylelint --fix"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
```

git commit 时触发 pre-commit 钩子，运行 lint-staged 命令，对\*.ts 执行 eslint 命令。eslint 要提前配置好。

commitlint 规范

[官网](https://commitlint.js.org)

```js
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

生成配置文件 commitlint.config.js

```js
const types = [
    "build", // 主要目的是修改项目构建系统（例如glup，webpack，rollup的配置等）的提交
    "ci", // 修改项目的持续集成流程（Kenkins、Travis等）的提交
    "chore", // 构建过程或辅助工具的变化
    "docs", // 文档提交（documents）
    "feat", // 新增功能（feature）
    "fix", // 修复 bug
    "pref", // 性能、体验相关的提交
    "refactor", // 代码重构
    "revert", // 回滚某个更早的提交
    "style", // 不影响程序逻辑的代码修改、主要是样式方面的优化、修改
    "test", // 测试相关的开发,
  ],
  typeEnum = {
    rules: {
      "type-enum": [2, "always", types],
    },
    value: () => {
      return types;
    },
  };

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": typeEnum.rules["type-enum"],
    "subject-full-stop": [0, "never"],
    "subject-case": [0, "never"],
  },
};
```

# 以上比较基本的搭建完毕，其他的可根据项目需求增加
