# D-005 代码仓库放在 OneDrive 同步目录中

- 状态：已采用（研究负责人选择）
- 日期：2026-11-25

## 决定

代码和 git 仓库直接放在 `ResearchGraph` 目录（位于 OneDrive 同步目录内）。

## 已知风险与约束

- `node_modules` 有大量小文件，会被 OneDrive 同步，可能拖慢同步或产生冲突副本。必要时可以在 OneDrive 中把该目录设为“始终保留在此设备上”，或改用 OneDrive 之外的位置。
- 方案 §9.3 规定：**活动的 SQLite 数据库不能放在网络共享盘或同步中的云盘目录**。阶段B引入本地服务时，数据库与内容存储必须放在 OneDrive 之外（例如 `~/Library/Application Support/` 下的应用目录），代码仓库位置不影响这一点。
- 在 Claude 桌面应用中，由应用直接启动的开发服务器访问 OneDrive 目录时可能被 macOS 权限提示阻塞；需要时在终端中运行 `npm run dev`。
