import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import { NMessageProvider, NConfigProvider, darkTheme } from 'naive-ui';
import StatsView from './views/StatsView.vue';
import 'uno.css';
import './styles/global.css';

const pinia = createPinia();
const app = createApp({
  render() {
    return h(NConfigProvider, { theme: darkTheme }, () =>
      h(NMessageProvider, {}, () =>
        h(StatsView)
      )
    );
  },
});

app.use(pinia);
app.mount('#app');
