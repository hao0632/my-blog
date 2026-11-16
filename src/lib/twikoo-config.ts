/**
 * Twikoo 评论配置
 *
 * Twikoo 分「云函数」和「前端」两部分，这个文件只管前端。
 * 你必须先部署云函数，再把它的地址填到下面的 TWIKOO_ENV_ID 里，评论框才会真正出现。
 *
 * 部署云函数：https://twikoo.js.org/backend.html （任选一种）
 *   - Netlify：免费额度充足，中国大陆访问速度不错（推荐）
 *   - Vercel：免费，但中国大陆访问较慢
 *   - 腾讯云 CloudBase：需要付费套餐
 *
 * 部署完成后，浏览器直接打开云函数地址，看到「Twikoo 云函数运行正常」就说明后端好了。
 * 那个地址就是 envId：
 *   Vercel / Netlify / 私有部署：带 https:// 前缀
 *   腾讯云 CloudBase：环境 ID，形如 "blog-1g2h3i4j"，不带 https://
 */

/** 留空则整站不显示评论区。填好地址后重新构建即可生效。 */
export const TWIKOO_ENV_ID =
  "https://mellow-semifreddo-e83d00.netlify.app/.netlify/functions/twikoo";

/** 是否已配置评论后端，未配置时页面不会渲染评论区 */
export const TWIKOO_ENABLED = TWIKOO_ENV_ID.trim().length > 0;

/** Twikoo 版本，前端与云函数保持一致即可 */
const TWIKOO_VERSION = "2.0.17";

/**
 * 前端脚本地址，按顺序尝试，前一个失败自动换下一个。
 * 前两个针对中国大陆网络环境优化，jsDelivr 作为全球兜底。
 *
 * 注意：如果你把云函数部署在腾讯云 CloudBase，必须把下面的 `twikoo.min.js`
 * 换成 `twikoo.all.min.js`（min 版为了减小体积剔除了腾讯云 SDK，登不上 CloudBase）。
 */
export const TWIKOO_SCRIPT_URLS = [
  `https://s4.zstatic.net/npm/twikoo@${TWIKOO_VERSION}/dist/twikoo.min.js`,
  `https://registry.npmmirror.com/twikoo/${TWIKOO_VERSION}/files/dist/twikoo.min.js`,
  `https://cdn.jsdelivr.net/npm/twikoo@${TWIKOO_VERSION}/dist/twikoo.min.js`,
];
