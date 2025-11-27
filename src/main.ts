import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "virtual:uno.css";
import "@unocss/reset/tailwind.css";
import "./styles/global.css";
import "./utils/echarts";  // 初始化 ECharts 组件

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");
