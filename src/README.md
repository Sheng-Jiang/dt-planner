# 项目结构说明

## 📁 文件夹结构

```
src/
├── app/                    # Next.js App Router 页面和 API 路由
│   ├── api/               # API 路由
│   ├── dashboard/         # 仪表板页面
│   └── (auth)/           # 认证相关页面组
├── components/            # React 组件
│   ├── auth/             # 认证相关组件
│   ├── ui/               # 通用 UI 组件 (建议新增)
│   └── layout/           # 布局组件 (建议新增)
├── contexts/             # React Context
├── lib/                  # 工具函数和配置
├── types/                # TypeScript 类型定义
├── hooks/                # 自定义 React Hooks (建议新增)
├── utils/                # 通用工具函数 (建议新增)
├── constants/            # 常量定义 (建议新增)
└── styles/               # 全局样式文件 (建议新增)
```

## 🔧 改进建议

### 立即改进

1. 新增 `hooks/` 文件夹 - 存放自定义 React Hooks
2. 新增 `utils/` 文件夹 - 存放通用工具函数
3. 新增 `constants/` 文件夹 - 存放应用常量
4. 新增 `components/ui/` 子文件夹 - 存放可复用的 UI 组件
5. 新增 `components/layout/` 子文件夹 - 存放布局相关组件

### 代码质量改进

1. 添加 ESLint 和 Prettier 配置
2. 完善 TypeScript 配置
3. 添加更多测试覆盖
4. 实现错误边界和加载状态管理

### 性能优化

1. 实现代码分割
2. 添加图片优化
3. 实现缓存策略
