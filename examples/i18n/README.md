# i18n (国际化) 使用指南

SecAuth 应用使用 React i18next 库实现国际化功能，支持多语言切换和本地化存储。

## 目录

- [概述](#概述)
- [项目结构](#项目结构)
- [核心 Hook 使用](#核心-hook-使用)
- [翻译文件管理](#翻译文件管理)
- [最佳实践](#最佳实践)
- [示例代码](#示例代码)
- [常见问题](#常见问题)

## 概述

项目的国际化系统具备以下特性：

- **多语言支持**: 目前支持英语(en)、中文(zh)、西班牙语(es)
- **自动语言检测**: 根据设备语言自动选择合适的语言
- **持久化存储**: 用户选择的语言会保存到本地存储
- **安全的翻译**: 提供错误处理和fallback机制
- **性能优化**: 异步初始化，避免阻塞应用启动

## 项目结构

```
secauth/
├── hooks/
│   └── useLanguage.ts          # 核心语言管理 Hook
├── utils/
│   └── i18n.ts                 # i18n 配置和初始化
├── locales/
│   ├── en/
│   │   └── common.json         # 英文翻译
│   ├── zh/
│   │   └── common.json         # 中文翻译
│   └── es/
│       └── common.json         # 西班牙语翻译
└── examples/
    └── i18n/
        ├── README.md           # 本文档
        ├── basic-usage.tsx     # 基础用法示例
        ├── language-switcher.tsx # 语言切换组件示例
        └── advanced-usage.tsx  # 高级用法示例
```

## 核心 Hook 使用

### useLanguage Hook

`useLanguage` 是主要的国际化 Hook，提供以下功能：

```typescript
import { useLanguage } from '@/hooks/useLanguage';

const MyComponent = () => {
  const { 
    currentLanguage,      // 当前语言代码
    changeLanguage,       // 切换语言函数
    getSupportedLanguages,// 获取支持的语言列表
    t                     // 翻译函数
  } = useLanguage();

  return (
    <View>
      <Text>{t('common.welcome')}</Text>
    </View>
  );
};
```

### API 详细说明

#### `t(key: string, options?: any): string`
翻译函数，用于获取指定key的翻译文本。

- **参数**:
  - `key`: 翻译键，使用点号分隔的路径，如 `'common.welcome'`
  - `options`: 可选的插值参数

- **返回值**: 翻译后的字符串，如果翻译失败则返回原key

- **特性**:
  - 安全处理：i18n未初始化时返回key而不是报错
  - 错误恢复：翻译失败时fallback到key
  - 组件卸载保护：组件卸载后调用不会报错

#### `currentLanguage: SupportedLanguage`
当前选中的语言代码，类型为 `'en' | 'zh' | 'es'`。

#### `changeLanguage(language: SupportedLanguage): Promise<void>`
切换应用语言的异步函数。

- **参数**: `language` - 目标语言代码
- **功能**: 切换语言并自动保存到本地存储

#### `getSupportedLanguages()`
获取支持的语言列表，返回格式：

```typescript
[
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'es', name: 'Español' }
]
```

## 翻译文件管理

### 文件结构

翻译文件位于 `locales/` 目录下，每种语言一个子目录：

```
locales/
├── en/common.json    # 英文翻译
├── zh/common.json    # 中文翻译
└── es/common.json    # 西班牙语翻译
```

### 翻译键命名规范

使用层级结构组织翻译键：

```json
{
  "common": {
    "yes": "Yes",
    "no": "No",
    "cancel": "Cancel"
  },
  "settings": {
    "title": "Settings",
    "language": "Language"
  },
  "navigation": {
    "home": "Home",
    "profile": "Profile"
  }
}
```

### 添加新翻译

1. 在 `locales/en/common.json` 中添加英文翻译（主语言）
2. 在其他语言文件中添加对应翻译
3. 确保所有语言文件的key结构一致

## 最佳实践

### 1. 组件中的使用

```typescript
import { useLanguage } from '@/hooks/useLanguage';

const MyComponent = () => {
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t('common.title')}</Text>
      <Button title={t('common.save')} />
    </View>
  );
};
```

### 2. 条件翻译

```typescript
const { t, currentLanguage } = useLanguage();

// 根据语言显示不同内容
const message = currentLanguage === 'zh' 
  ? t('message.chinese') 
  : t('message.default');
```

### 3. 参数插值

```typescript
// 翻译文件中：
// "welcome": "Welcome, {{name}}!"

const { t } = useLanguage();
const welcomeMsg = t('common.welcome', { name: 'John' });
// 结果: "Welcome, John!"
```

### 4. 语言切换组件

```typescript
const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, getSupportedLanguages } = useLanguage();
  const languages = getSupportedLanguages();

  return (
    <View>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => changeLanguage(lang.code)}
          style={[
            styles.languageItem,
            currentLanguage === lang.code && styles.selected
          ]}
        >
          <Text>{lang.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 5. 错误处理

Hook 内置了完善的错误处理：

- i18n 未初始化时的安全fallback
- 翻译键不存在时返回键名
- 组件卸载后的调用保护
- 存储操作失败的降级处理

### 6. 性能优化提示

- 避免在render函数中重复调用 `getSupportedLanguages()`
- 使用 `useCallback` 缓存语言切换函数
- 翻译文件按功能模块分离，减少单文件大小

## 示例代码

查看以下示例文件了解具体用法：

- [`basic-usage.tsx`](./basic-usage.tsx) - 基础翻译用法
- [`language-switcher.tsx`](./language-switcher.tsx) - 语言切换组件
- [`advanced-usage.tsx`](./advanced-usage.tsx) - 高级用法和最佳实践

## 常见问题

### Q: 翻译不生效怎么办？

A: 检查以下几点：
1. 确保翻译键在所有语言文件中都存在
2. 检查键名拼写是否正确
3. 确认 i18n 已正确初始化

### Q: 如何添加新语言？

A: 
1. 在 `locales/` 下创建新语言目录
2. 复制 `en/common.json` 到新目录并翻译
3. 在 `utils/i18n.ts` 中添加新语言资源
4. 在 `useLanguage.ts` 中更新 `SupportedLanguage` 类型

### Q: 应用启动时看到翻译键而不是翻译文本？

A: 这是正常现象，i18n 异步初始化需要时间。Hook 会在初始化完成后自动更新显示。

### Q: 如何处理复杂的文本格式？

A: 使用插值参数：

```json
{
  "message": "您有 {{count}} 条新消息"
}
```

```typescript
t('message', { count: 5 }) // "您有 5 条新消息"
```

### Q: 切换语言后部分组件没有更新？

A: 确保组件正确使用了 `useLanguage` Hook，React i18next 会自动处理重新渲染。 