// Angular example
import { Component, OnInit, ErrorHandler, Injectable } from '@angular/core';
import { getLogger, LogLevel, LogStrategy } from '@dolasoft/logger';

// Create logger instance
const logger = getLogger({
  strategy: LogStrategy.CONSOLE,
  level: LogLevel.INFO,
  enableConsole: true
});

// Custom error handler
@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    logger.error('Angular error handler', error, {
      component: 'Angular',
      timestamp: new Date().toISOString()
    });
  }
}

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>{{ title }}</h1>
      <p>Click count: {{ clickCount }}</p>
      <button (click)="onClick()">Click me</button>
      <button (click)="onError()">Trigger Error</button>
    </div>
  `
})
export class AppComponent implements OnInit {
  title = 'Angular with DolaSoft Logger';
  clickCount = 0;

  ngOnInit(): void {
    logger.info('Angular component initialized', {
      component: 'AppComponent',
      timestamp: new Date().toISOString()
    });
  }

  onClick(): void {
    this.clickCount++;
    logger.info('Button clicked in Angular', {
      clickCount: this.clickCount,
      component: 'AppComponent',
      timestamp: new Date().toISOString()
    });
  }

  onError(): void {
    try {
      throw new Error('Test error from Angular');
    } catch (error) {
      logger.error('Error in Angular component', error, {
        component: 'AppComponent',
        method: 'onError'
      });
    }
  }
}

// Service example
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logger = getLogger({
    strategy: LogStrategy.CONSOLE,
    level: LogLevel.DEBUG,
    enableConsole: true
  });

  logUserAction(action: string, context?: any): void {
    this.logger.info('User action', {
      action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  logApiCall(endpoint: string, method: string, status: number): void {
    this.logger.info('API call', {
      endpoint,
      method,
      status,
      timestamp: new Date().toISOString()
    });
  }

  logError(error: Error, context?: any): void {
    this.logger.error('Service error', error, {
      service: 'LoggingService',
      timestamp: new Date().toISOString(),
      ...context
    });
  }
}
