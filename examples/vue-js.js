// Vue.js example
import { createApp } from 'vue';
import { getLogger, LogLevel, LogStrategy } from '@dolasoft/logger';

// Create logger instance
const logger = getLogger({
  strategy: LogStrategy.CONSOLE,
  level: LogLevel.INFO,
  enableConsole: true
});

// Vue app
const app = createApp({
  data() {
    return {
      message: 'Hello Vue with DolaSoft Logger!',
      clickCount: 0
    };
  },
  
  mounted() {
    logger.info('Vue app mounted', {
      component: 'App',
      timestamp: new Date().toISOString()
    });
  },
  
  methods: {
    handleClick() {
      this.clickCount++;
      logger.info('Button clicked', {
        clickCount: this.clickCount,
        timestamp: new Date().toISOString()
      });
    },
    
    handleError() {
      try {
        throw new Error('Test error from Vue');
      } catch (error) {
        logger.error('Error in Vue component', error, {
          component: 'App',
          method: 'handleError'
        });
      }
    }
  },
  
  template: `
    <div>
      <h1>{{ message }}</h1>
      <p>Click count: {{ clickCount }}</p>
      <button @click="handleClick">Click me</button>
      <button @click="handleError">Trigger Error</button>
    </div>
  `
});

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  logger.error('Vue error handler', err, {
    component: instance?.$options.name || 'Unknown',
    info: info
  });
};

// Mount the app
app.mount('#app');
