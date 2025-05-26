import EventEmitter from "eventemitter3";
import { useEffect } from "react";

const emitter = new EventEmitter();

export function UseSub(event, callback) {
  const unsubscribe = () => {
    emitter.off(event, callback);
  };

  useEffect(() => {
    emitter.on(event, callback);
    return unsubscribe;
  }, []);

  return unsubscribe;
}

export const usePub = () => {
  return (event, data) => {
    emitter.emit(event, data);
  };
};
