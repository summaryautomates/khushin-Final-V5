declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    enableDamping: boolean;
    autoRotate: boolean;
    update(): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Object3D, Scene } from 'three';
  export interface GLTF {
    scene: Scene;
    scenes: Scene[];
  }
  export class GLTFLoader {
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (error: ErrorEvent) => void
    ): void;
  }
}
