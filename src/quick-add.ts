import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import { NMessageProvider, NConfigProvider, darkTheme } from 'naive-ui';
import QuickAdd from './components/QuickAdd.vue';
import 'uno.css';

const pinia = createPinia();
const app = createApp({
  render() {
    return h(NConfigProvider, { theme: darkTheme }, () =>
      h(NMessageProvider, {}, () =>
        h(QuickAdd)
      )
    );
  },
});

app.use(pinia);
app.mount('#app');
