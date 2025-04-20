import resize from './sizeDirect';
import focus from './focus';
const allDirects = { resize, focus };
export default {
  install(app: any) {
    Object.keys(allDirects).forEach((key) => {
      app.directive(key, allDirects[key]);
    });
  },
};
