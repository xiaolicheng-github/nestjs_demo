import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { useUserStore } from './stores/user';

export default defineComponent({
  name: 'App',
  setup() {
    const userStore = useUserStore();

    userStore.refreshUserInfo();

    return {};
  },
  render() {
    return <RouterView />;
  },
});
