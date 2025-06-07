import EventEmitter from "eventemitter3";
import { Extent } from "ol/extent";
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

export const MapMoveTo = (view: Object) => {
  const fx = usePub();
  fx("MapMoveTo", view);
};

export const FitMapToExtent = (extent: Extent) => {
  const fx = usePub();
  fx("MapFitTo", extent);
};
