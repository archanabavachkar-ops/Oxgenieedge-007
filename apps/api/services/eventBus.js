import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
  }

  emit(event, data) {
    console.log(`[EVENT] ${event}`, data || '');
    return super.emit(event, data);
  }
}

const eventBus = new EventBus();

export default eventBus;