import state from '../state';
import inspector from '../../inspect/inspector.js';

let count = 0;

class Element {
  constructor (node, id) {
    if (!id) {
      count++;
      this.id = count;
    } else this.id = id;
    this.node = node;
    this.instances = [];
    this._children = [];
    this._parent = null;
  }

  get html () {
    const end = this.node.outerHTML.indexOf('>');
    return this.node.outerHTML.substring(0, end + 1);
  }

  create (registration) {
    if (this.hasInstance(registration.InstanceClass.name)) {
      inspector.debug(`instance of ${registration.InstanceClass.name} already exists on element [${this.id}]`);
      return;
    }
    const instance = registration.create(this);
    this.instances.push(instance);
    instance._config(this, registration);
  }

  get parent () {
    return this._parent;
  }

  get children () {
    return this._children;
  }

  addChild (child, index) {
    if (this._children.indexOf(child) > -1) return null;
    child._parent = this;
    if (!isNaN(index) && index > -1 && index < this._children.length) this._children.splice(index, 0, child);
    else this._children.push(child);
    return child;
  }

  removeChild (child) {
    const index = this._children.indexOf(child);
    if (index === -1) return null;
    child._parent = null;
    this._children.splice(index, 1);
  }

  emit (type, data) {
    const elements = state.getModule('observe').collection;
    for (const element of elements) element._emit(type, data);
  }

  _emit (type, data) {
    for (const instance of this.instances) instance._emitter.emit(type, data);
  }

  ascend (type, data) {
    if (this._parent) this._parent._ascend(type, data);
  }

  _ascend (type, data) {
    for (const instance of this.instances) instance._ascent.emit(type, data);
    if (this._parent) this._parent._ascend(type, data);
  }

  descend (type, data) {
    for (const child of this._children) child._descend(type, data);
  }

  _descend (type, data) {
    for (const instance of this.instances) instance._descent.emit(type, data);
    for (const child of this._children) child._descend(type, data);
  }

  getInstance (instanceClassName) {
    for (const instance of this.instances) if (instance.constructor.name === instanceClassName) return instance;
    return null;
  }

  hasInstance (instanceClassName) {
    for (const instance of this.instances) if (instance.constructor.name === instanceClassName) return true;
    return false;
  }

  getDescendantInstances (instanceClassName, stopAtInstanceClassName, stopAtFirstInstance) {
    if (!instanceClassName) return [];
    const instances = [];
    for (const child of this._children) {
      const instance = child.getInstance(instanceClassName);
      if (instance) {
        instances.push(instance);
        if (stopAtFirstInstance) continue;
      }
      if ((!stopAtInstanceClassName || !child.hasInstance(stopAtInstanceClassName)) && child.children.length) instances.push.apply(instances, child.getDescendantInstances(instanceClassName, stopAtInstanceClassName, stopAtFirstInstance));
    }
    return instances;
  }

  getAscendantInstance (instanceClassName, stopAtInstanceClassName) {
    if (!instanceClassName || !this._parent) return null;
    const instance = this._parent.getInstance(instanceClassName);
    if (instance) return instance;
    if (stopAtInstanceClassName && this._parent.hasInstance(stopAtInstanceClassName)) return null;
    return this._parent.getAscendantInstance(instanceClassName, stopAtInstanceClassName);
  }

  remove (instance) {
    const index = this.instances.indexOf(instance);
    if (index > -1) this.instances.splice(index, 1);
  }

  dispose () {
    for (const instance of this.instances) instance._dispose();
    this.instances.length = 0;
    state.remove('observe', this);
    this.parent.removeChild(this);
    this._children.length = 0;
    inspector.debug(`remove element [${this.id}] ${this.html}`);
  }

  examine () {
    for (let i = this.instances.length - 1; i > -1; i--) this.instances[i].examine();
  }
}

export { Element };